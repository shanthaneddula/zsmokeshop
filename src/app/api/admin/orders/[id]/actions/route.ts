import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth-server';
import { getOrderById, updateOrder } from '@/lib/order-storage-service';
import { logActivity } from '@/lib/activity-log-service';
import { PickupOrder } from '@/types/orders';
import { User } from '@/types/users';

/**
 * POST /api/admin/orders/[id]/actions
 * Perform order actions: accept, reject, suggest-replacement
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.user as User;

    // Check permission
    if (!user.permissions.manageOrders && !user.permissions.viewOrders) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: orderId } = await context.params;
    const body = await request.json();
    const { action, productIndex, replacementProduct, replacementNote } = body;

    // Get the order
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let updatedOrder: PickupOrder;
    let activityDescription: string;

    switch (action) {
      case 'accept':
        // Accept the order as-is (confirm all items are available)
        updatedOrder = {
          ...order,
          status: 'confirmed',
          timeline: {
            ...order.timeline,
            confirmedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
        
        activityDescription = `Accepted order ${order.orderNumber} - all items available`;
        
        // TODO: Send notification to customer (SMS/Email)
        await updateOrder(orderId, updatedOrder);
        
        await logActivity(
          user.id,
          user.username,
          'order_accepted',
          'order',
          activityDescription,
          order.id
        );
        
        break;

      case 'reject':
        // Reject the order (item not available, cannot fulfill)
        updatedOrder = {
          ...order,
          status: 'cancelled',
          timeline: {
            ...order.timeline,
            cancelledAt: new Date().toISOString(),
          },
          storeNotes: `${order.storeNotes || ''}\n\nRejected by ${user.username}: ${body.reason || 'Items unavailable'}`.trim(),
          updatedAt: new Date().toISOString(),
        };
        
        activityDescription = `Rejected order ${order.orderNumber}: ${body.reason || 'Items unavailable'}`;
        
        // TODO: Send rejection notification to customer
        await updateOrder(orderId, updatedOrder);
        
        await logActivity(
          user.id,
          user.username,
          'order_rejected',
          'order',
          activityDescription,
          order.id
        );
        
        break;

      case 'suggest-replacement':
        // Suggest a replacement product for a specific item
        if (productIndex === undefined || !replacementProduct) {
          return NextResponse.json(
            { error: 'Missing productIndex or replacementProduct' },
            { status: 400 }
          );
        }

        const updatedItems = [...order.items];
        if (productIndex < 0 || productIndex >= updatedItems.length) {
          return NextResponse.json({ error: 'Invalid productIndex' }, { status: 400 });
        }

        // Mark the item as having a suggested replacement
        updatedItems[productIndex] = {
          ...updatedItems[productIndex],
          replacementProductId: replacementProduct.id,
          replacementProductName: replacementProduct.name,
          replacementPricePerUnit: replacementProduct.price,
          replacementNote: replacementNote || undefined,
          replacementSuggestedAt: new Date().toISOString(),
          replacementSuggestedBy: user.username,
        };

        // Calculate new total if price changed
        const newItemTotal = updatedItems[productIndex].quantity * replacementProduct.price;
        const oldItemTotal = updatedItems[productIndex].totalPrice;
        const newOrderTotal = order.total - oldItemTotal + newItemTotal;

        updatedItems[productIndex].totalPrice = newItemTotal;

        updatedOrder = {
          ...order,
          items: updatedItems,
          total: newOrderTotal,
          updatedAt: new Date().toISOString(),
        };

        // Add communication record
        const communicationMessage = `We suggest replacing "${updatedItems[productIndex].productName}" with "${replacementProduct.name}" ($${replacementProduct.price.toFixed(2)}). ${replacementNote || ''}`.trim();
        
        updatedOrder.communications = [
          ...order.communications,
          {
            id: crypto.randomUUID(),
            direction: 'to-customer',
            method: 'sms',
            message: communicationMessage,
            timestamp: new Date().toISOString(),
            status: 'sent',
          },
        ];

        activityDescription = `Suggested replacement for order ${order.orderNumber}: ${updatedItems[productIndex].productName} → ${replacementProduct.name}`;
        
        // TODO: Send SMS to customer with approval link
        await updateOrder(orderId, updatedOrder);
        
        await logActivity(
          user.id,
          user.username,
          'replacement_suggested',
          'order',
          activityDescription,
          order.id
        );
        
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order ${action} successful`,
    });

  } catch (error) {
    console.error('Error performing order action:', error);
    return NextResponse.json(
      { error: 'Failed to perform order action' },
      { status: 500 }
    );
  }
}
