import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, updateOrder } from '@/lib/order-storage-service';
import { 
  sendOrderReadySMS, 
  sendOrderCancelledSMS, 
  sendNoShowSMS 
} from '@/lib/twilio-service';
import { UpdateOrderStatusRequest } from '@/types/orders';

/**
 * POST /api/orders/[id]/update-status
 * Update order status and send appropriate SMS notifications
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await context.params;
    const body: UpdateOrderStatusRequest = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Update order status
    const updatedOrder = await updateOrderStatus(orderId, body.status, body.storeNotes);

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Send appropriate SMS notification
    try {
      let smsComm;

      switch (body.status) {
        case 'ready':
          if (updatedOrder.timeline.pickupDeadline) {
            smsComm = await sendOrderReadySMS(
              updatedOrder.customerPhone,
              updatedOrder.orderNumber,
              updatedOrder.storeLocation,
              new Date(updatedOrder.timeline.pickupDeadline)
            );
          }
          break;

        case 'cancelled':
          smsComm = await sendOrderCancelledSMS(
            updatedOrder.customerPhone,
            updatedOrder.orderNumber,
            body.storeNotes
          );
          break;

        case 'no-show':
          smsComm = await sendNoShowSMS(
            updatedOrder.customerPhone,
            updatedOrder.orderNumber
          );
          break;
      }

      // Add SMS communication to order if sent
      if (smsComm) {
        await updateOrder(orderId, {
          communications: [...updatedOrder.communications, smsComm],
        });
      }
    } catch (smsError) {
      console.error('Error sending SMS notification:', smsError);
      // Status update still succeeds even if SMS fails
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${body.status}`,
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
