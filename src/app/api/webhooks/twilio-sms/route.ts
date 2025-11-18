import { NextRequest, NextResponse } from 'next/server';
import { 
  parseIncomingSMS, 
  isReplacementApproval, 
  isReplacementRejection 
} from '@/lib/twilio-service';
import { getOrdersByPhone, updateOrder } from '@/lib/order-storage-service';

/**
 * POST /api/webhooks/twilio-sms
 * Handle incoming SMS from customers (Twilio webhook)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse Twilio webhook data
    const formData = await request.formData();
    const twilioData: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      twilioData[key] = value.toString();
    });

    const incomingSMS = parseIncomingSMS(twilioData);

    // Log incoming message
    console.log('Incoming SMS:', {
      from: incomingSMS.from,
      body: incomingSMS.body,
    });

    // Find customer's most recent pending order
    const orders = await getOrdersByPhone(incomingSMS.from);
    const pendingOrders = orders.filter(
      o => o.status === 'pending' || o.status === 'confirmed'
    );

    if (pendingOrders.length === 0) {
      // No pending orders, send generic response
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Message>Thank you for contacting Z SMOKE SHOP! We couldn't find any pending orders for this number. Please call us for assistance.</Message>
        </Response>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    }

    const order = pendingOrders[0]; // Most recent pending order

    // Check if customer is responding to replacement suggestion
    const pendingReplacementItem = order.items.find(
      item => item.replacementProductId && !item.wasReplaced
    );

    if (pendingReplacementItem) {
      if (isReplacementApproval(incomingSMS.body)) {
        // Customer approved replacement
        const itemIndex = order.items.indexOf(pendingReplacementItem);
        const updatedItems = [...order.items];
        updatedItems[itemIndex] = {
          ...pendingReplacementItem,
          wasReplaced: true,
          replacementApprovedAt: new Date().toISOString(),
        };

        // Add communication record
        const communication = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          direction: 'from-customer' as const,
          message: incomingSMS.body,
          method: 'sms' as const,
          status: 'delivered' as const,
          twilioMessageSid: incomingSMS.messageSid,
        };

        await updateOrder(order.id, {
          items: updatedItems,
          communications: [...order.communications, communication],
        });

        return new NextResponse(
          `<?xml version="1.0" encoding="UTF-8"?>
          <Response>
            <Message>Great! We've updated your order ${order.orderNumber} with ${pendingReplacementItem.replacementProductName}. You'll receive a text when ready for pickup.</Message>
          </Response>`,
          {
            status: 200,
            headers: { 'Content-Type': 'text/xml' },
          }
        );
      } else if (isReplacementRejection(incomingSMS.body)) {
        // Customer rejected replacement - remove item from order
        const itemIndex = order.items.indexOf(pendingReplacementItem);
        const updatedItems = order.items.filter((_, i) => i !== itemIndex);

        // Recalculate total
        const newSubtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const newTax = newSubtotal * 0.0825;
        const newTotal = newSubtotal + newTax;

        // Add communication record
        const communication = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          direction: 'from-customer' as const,
          message: incomingSMS.body,
          method: 'sms' as const,
          status: 'delivered' as const,
          twilioMessageSid: incomingSMS.messageSid,
        };

        await updateOrder(order.id, {
          items: updatedItems,
          subtotal: newSubtotal,
          tax: newTax,
          total: newTotal,
          communications: [...order.communications, communication],
        });

        const responseMsg = updatedItems.length > 0
          ? `We've removed ${pendingReplacementItem.productName} from order ${order.orderNumber}. New total: $${newTotal.toFixed(2)}. You'll receive a text when ready.`
          : `We've removed ${pendingReplacementItem.productName}. Your order ${order.orderNumber} is now empty and has been cancelled.`;

        // Cancel order if no items left
        if (updatedItems.length === 0) {
          await updateOrder(order.id, { status: 'cancelled' });
        }

        return new NextResponse(
          `<?xml version="1.0" encoding="UTF-8"?>
          <Response>
            <Message>${responseMsg}</Message>
          </Response>`,
          {
            status: 200,
            headers: { 'Content-Type': 'text/xml' },
          }
        );
      }
    }

    // Generic response for other messages
    const communication = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      direction: 'from-customer' as const,
      message: incomingSMS.body,
      method: 'sms' as const,
      status: 'delivered' as const,
      twilioMessageSid: incomingSMS.messageSid,
    };

    await updateOrder(order.id, {
      communications: [...order.communications, communication],
      customerNotes: order.customerNotes 
        ? `${order.customerNotes}\n[SMS]: ${incomingSMS.body}`
        : `[SMS]: ${incomingSMS.body}`,
    });

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Thanks for your message about order ${order.orderNumber}. Our team will review and respond soon.</Message>
      </Response>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    );

  } catch (error) {
    console.error('Error processing Twilio webhook:', error);
    
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Sorry, we encountered an error. Please call us for assistance.</Message>
      </Response>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  }
}
