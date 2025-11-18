import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/order-storage-service';
import { sendReplacementSuggestionSMS } from '@/lib/twilio-service';
import { getProduct } from '@/lib/product-storage-service';
import { SuggestReplacementRequest } from '@/types/orders';

/**
 * POST /api/orders/[id]/suggest-replacement
 * Store suggests a product replacement to customer via SMS
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await context.params;
    const body: SuggestReplacementRequest = await request.json();

    if (body.orderItemIndex === undefined || !body.replacementProductId) {
      return NextResponse.json(
        { error: 'orderItemIndex and replacementProductId are required' },
        { status: 400 }
      );
    }

    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (body.orderItemIndex < 0 || body.orderItemIndex >= order.items.length) {
      return NextResponse.json(
        { error: 'Invalid item index' },
        { status: 400 }
      );
    }

    const item = order.items[body.orderItemIndex];
    
    // Get replacement product details
    const replacementProduct = await getProduct(body.replacementProductId);
    
    if (!replacementProduct) {
      return NextResponse.json(
        { error: 'Replacement product not found' },
        { status: 404 }
      );
    }

    // Send SMS to customer
    const smsComm = await sendReplacementSuggestionSMS(
      order.customerPhone,
      order.orderNumber,
      item.productName,
      replacementProduct.name
    );

    // Store pending replacement info
    const updatedItems = [...order.items];
    updatedItems[body.orderItemIndex] = {
      ...item,
      replacementProductId: body.replacementProductId,
      replacementProductName: replacementProduct.name,
      // Note: wasReplaced will be set to true when customer approves
    };

    // Update order with communication and pending replacement
    const updatedOrder = await updateOrder(orderId, {
      items: updatedItems,
      communications: [...order.communications, smsComm],
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Replacement suggestion sent to customer',
    });

  } catch (error) {
    console.error('Error suggesting replacement:', error);
    return NextResponse.json(
      { error: 'Failed to suggest replacement' },
      { status: 500 }
    );
  }
}
