import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/order-storage-service';
import { 
  sendOrderConfirmationSMS, 
  sendStoreNotificationSMS,
  formatPhoneNumber,
  isValidPhoneNumber 
} from '@/lib/twilio-service';
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
    if (!body.customerName || !body.customerPhone || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, customerPhone, and items are required' },
        { status: 400 }
      );
    }

    // Validate phone number
    if (!isValidPhoneNumber(body.customerPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please use a 10-digit US phone number.' },
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
      customerPhone: formatPhoneNumber(body.customerPhone),
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

    // Send SMS notifications
    try {
      // Send confirmation to customer
      const customerSMS = await sendOrderConfirmationSMS(
        createdOrder.customerPhone,
        createdOrder.orderNumber,
        createdOrder.storeLocation,
        estimatedReadyTime
      );

      // Send notification to store
      const storeSMS = await sendStoreNotificationSMS(
        createdOrder.storeLocation,
        createdOrder.orderNumber,
        createdOrder.customerName,
        orderItems.reduce((sum, item) => sum + item.quantity, 0),
        createdOrder.total
      );

      // Add communications to order
      createdOrder.communications = [customerSMS, storeSMS];
      
      // Note: In a production app, you'd want to update the order with communications
      // For now, we'll just include them in the response
    } catch (smsError) {
      console.error('Error sending SMS notifications:', smsError);
      // Order is still created even if SMS fails
    }

    return NextResponse.json({
      success: true,
      order: createdOrder,
      message: 'Order placed successfully! Check your phone for confirmation.',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}
