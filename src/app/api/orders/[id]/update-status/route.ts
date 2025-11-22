import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, updateOrder } from '@/lib/order-storage-service';
import { 
  sendOrderReadySMS, 
  sendOrderCancelledSMS, 
  sendNoShowSMS 
} from '@/lib/twilio-service';
import {
  sendOrderStatusUpdateEmail
} from '@/lib/resend-service';
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

    // Send appropriate notifications (SMS and Email)
    try {
      let smsComm, emailComm;

      switch (body.status) {
        case 'ready':
          // Send SMS notification
          if (updatedOrder.customerPhone && updatedOrder.timeline.pickupDeadline) {
            smsComm = await sendOrderReadySMS(
              updatedOrder.customerPhone,
              updatedOrder.orderNumber,
              updatedOrder.storeLocation,
              new Date(updatedOrder.timeline.pickupDeadline)
            );
          }
          
          // Send Email notification
          if (updatedOrder.customerEmail) {
            emailComm = await sendOrderStatusUpdateEmail(
              updatedOrder.customerEmail,
              updatedOrder.customerName,
              updatedOrder.orderNumber,
              'ready',
              'Your order is ready for pickup!',
              `Your order is ready and waiting for you at our ${updatedOrder.storeLocation === 'william-cannon' ? 'William Cannon' : 'Cameron Rd'} location. Please pick it up within the next hour.`,
              updatedOrder.timeline.pickupDeadline ? new Date(updatedOrder.timeline.pickupDeadline) : undefined
            );
          }
          break;

        case 'cancelled':
          // Send SMS notification
          if (updatedOrder.customerPhone) {
            smsComm = await sendOrderCancelledSMS(
              updatedOrder.customerPhone,
              updatedOrder.orderNumber,
              body.storeNotes
            );
          }
          
          // Send Email notification
          if (updatedOrder.customerEmail) {
            emailComm = await sendOrderStatusUpdateEmail(
              updatedOrder.customerEmail,
              updatedOrder.customerName,
              updatedOrder.orderNumber,
              'cancelled',
              'Your order has been cancelled',
              body.storeNotes || 'Your order has been cancelled. Please contact the store if you have any questions.'
            );
          }
          break;

        case 'no-show':
          // Send SMS notification
          if (updatedOrder.customerPhone) {
            smsComm = await sendNoShowSMS(
              updatedOrder.customerPhone,
              updatedOrder.orderNumber
            );
          }
          
          // Send Email notification
          if (updatedOrder.customerEmail) {
            emailComm = await sendOrderStatusUpdateEmail(
              updatedOrder.customerEmail,
              updatedOrder.customerName,
              updatedOrder.orderNumber,
              'no-show',
              'Order pickup window expired',
              'Your order pickup window has expired. Please contact the store to reschedule or arrange for a refund.'
            );
          }
          break;
      }

      // Add communications to order if sent
      const newCommunications = [...updatedOrder.communications];
      if (smsComm) newCommunications.push(smsComm);
      if (emailComm) newCommunications.push(emailComm);
      
      if (newCommunications.length > updatedOrder.communications.length) {
        await updateOrder(orderId, {
          communications: newCommunications,
        });
      }
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Status update still succeeds even if notifications fail
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
