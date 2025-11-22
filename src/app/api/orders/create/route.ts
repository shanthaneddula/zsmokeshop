import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/order-storage-service';
import { 
  sendOrderConfirmationSMS, 
  sendStoreNotificationSMS,
  formatPhoneNumber,
  isValidPhoneNumber 
} from '@/lib/twilio-service';
import {
  sendOrderConfirmationEmail,
  sendStoreNotificationEmail,
  isValidEmail
} from '@/lib/resend-service';
import { CreateOrderRequest, PickupOrder, OrderItem } from '@/types/orders';
import { getProduct } from '@/lib/product-storage-service';

/**
 * POST /api/orders/create
 * Create a new pickup order
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.customerName || !body.items || body.items.length === 0 || !body.notificationMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, items, and notificationMethod are required' },
        { status: 400 }
      );
    }

    // Validate notification method and contact info
    if (body.notificationMethod === 'sms') {
      if (!body.customerPhone) {
        return NextResponse.json(
          { error: 'Phone number is required for SMS notifications' },
          { status: 400 }
        );
      }
      if (!isValidPhoneNumber(body.customerPhone)) {
        return NextResponse.json(
          { error: 'Invalid phone number format. Please use a 10-digit US phone number.' },
          { status: 400 }
        );
      }
    } else if (body.notificationMethod === 'email') {
      if (!body.customerEmail) {
        return NextResponse.json(
          { error: 'Email address is required for email notifications' },
          { status: 400 }
        );
      }
      if (!isValidEmail(body.customerEmail)) {
        return NextResponse.json(
          { error: 'Invalid email address format' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid notification method. Must be "email" or "sms"' },
        { status: 400 }
      );
    }

    // Validate store location
    if (!['william-cannon', 'cameron-rd'].includes(body.storeLocation)) {
      return NextResponse.json(
        { error: 'Invalid store location' },
        { status: 400 }
      );
    }

    // Build order items with product details
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of body.items) {
      const product = await getProduct(item.productId);
      
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        category: product.category,
        quantity: item.quantity,
        pricePerUnit: product.price,
        totalPrice: itemTotal,
        replacementPreference: item.replacementPreference,
        wasReplaced: false,
      });
    }

    // Calculate tax (8.25% for Austin, TX)
    const tax = subtotal * 0.0825;
    const total = subtotal + tax;

    // Estimated ready time (30 minutes from now)
    const estimatedReadyTime = new Date(Date.now() + 30 * 60 * 1000);

    // Create order
    const now = new Date().toISOString();
    const order: Omit<PickupOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'> = {
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone ? formatPhoneNumber(body.customerPhone) : '',
      customerEmail: body.customerEmail?.trim(),
      notificationMethod: body.notificationMethod,
      items: orderItems,
      subtotal,
      tax,
      total,
      storeLocation: body.storeLocation,
      status: 'pending',
      timeline: {
        placedAt: now,
      },
      communications: [],
      customerNotes: body.customerNotes?.trim(),
    };

    const createdOrder = await createOrder(order);

    // Send notifications based on customer preference
    try {
      if (body.notificationMethod === 'sms' && createdOrder.customerPhone) {
        // Send SMS notifications
        const customerSMS = await sendOrderConfirmationSMS(
          createdOrder.customerPhone,
          createdOrder.orderNumber,
          createdOrder.storeLocation,
          estimatedReadyTime
        );

        const storeSMS = await sendStoreNotificationSMS(
          createdOrder.storeLocation,
          createdOrder.orderNumber,
          createdOrder.customerName,
          orderItems.reduce((sum, item) => sum + item.quantity, 0),
          createdOrder.total
        );

        createdOrder.communications = [customerSMS, storeSMS];
      } else if (body.notificationMethod === 'email' && createdOrder.customerEmail) {
        // Send email notifications
        const customerEmail = await sendOrderConfirmationEmail(
          createdOrder.customerEmail,
          createdOrder.customerName,
          createdOrder.orderNumber,
          createdOrder.storeLocation,
          estimatedReadyTime,
          orderItems.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.totalPrice,
          })),
          createdOrder.total
        );

        const storeEmail = await sendStoreNotificationEmail(
          createdOrder.storeLocation,
          createdOrder.orderNumber,
          createdOrder.customerName,
          createdOrder.customerEmail,
          orderItems.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.totalPrice,
          })),
          createdOrder.total,
          'email'
        );

        createdOrder.communications = [customerEmail, storeEmail];
      }
      
      // Note: In a production app, you'd want to update the order with communications
      // For now, we'll just include them in the response
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Order is still created even if notifications fail
    }

    const notificationMessage = body.notificationMethod === 'email' 
      ? 'Order placed successfully! Check your email for confirmation.'
      : 'Order placed successfully! Check your phone for confirmation.';

    return NextResponse.json({
      success: true,
      order: createdOrder,
      orderId: createdOrder.id,
      message: notificationMessage,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}
