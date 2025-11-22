import { NextRequest, NextResponse } from 'next/server';
import { getOrderByNumber } from '@/lib/order-storage-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderNumber = searchParams.get('orderNumber');
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');

    if (!orderNumber || (!phone && !email)) {
      return NextResponse.json(
        { error: 'Order number and phone number or email address are required' },
        { status: 400 }
      );
    }

    // Get order by number
    const order = await getOrderByNumber(orderNumber.trim().toUpperCase());

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify contact info matches
    let contactMatches = false;
    
    if (phone) {
      // Verify phone number matches (normalize both for comparison)
      const normalizePhone = (p: string) => p.replace(/\D/g, '');
      const orderPhone = normalizePhone(order.customerPhone || '');
      const inputPhone = normalizePhone(phone);
      contactMatches = orderPhone === inputPhone;
    } else if (email) {
      // Verify email matches (case-insensitive)
      const orderEmail = (order.customerEmail || '').toLowerCase().trim();
      const inputEmail = email.toLowerCase().trim();
      contactMatches = orderEmail === inputEmail;
    }

    if (!contactMatches) {
      return NextResponse.json(
        { error: 'Contact information does not match order' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: 'Failed to track order' },
      { status: 500 }
    );
  }
}
