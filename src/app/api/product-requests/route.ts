import { NextRequest, NextResponse } from 'next/server';
import { CONTACT_PREFERENCES, RATE_LIMITS, type ContactPreference } from '@/lib/inbox-config';
import { getClientIp, isRateLimited } from '@/lib/inbox-rate-limit';
import { createProductRequest, productRequestExists } from '@/lib/product-request-storage';
import {
  sendProductRequestAutoReply,
  sendProductRequestStaffEmail,
} from '@/lib/inbox-email';
import { validateSubmittedImages } from '@/lib/product-request-images';
import { BLOCKED_REQUEST_MESSAGE, requestTextIsBlocked, requestTextShouldFlag } from '@/lib/restricted-request';
import {
  cleanText,
  isChecked,
  isHoneypotTriggered,
  isUuid,
  multilineText,
  normalizePhone,
  requireEmail,
} from '@/lib/inbox-validation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
    const data = body as Record<string, unknown>;

    if (isHoneypotTriggered(data.website)) {
      return NextResponse.json({ success: true });
    }

    const ip = getClientIp(request.headers);
    if (await isRateLimited('request-ip', ip, RATE_LIMITS.requestPerIp, RATE_LIMITS.windowSeconds)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later or call the store.' },
        { status: 429 }
      );
    }

    const id = typeof data.id === 'string' ? data.id : '';
    if (!isUuid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid request id' }, { status: 400 });
    }

    const productName = cleanText(data.productName, 150);
    const brand = cleanText(data.brand, 100) || undefined;
    const details = multilineText(data.details, 3000) || undefined;
    const customerName = cleanText(data.customerName, 100);
    const email = data.email ? requireEmail(data.email) : undefined;
    const phone = normalizePhone(data.phone);
    const preferenceRaw = typeof data.contactPreference === 'string' ? data.contactPreference : '';
    const contactPreference = CONTACT_PREFERENCES.includes(preferenceRaw as ContactPreference)
      ? (preferenceRaw as ContactPreference)
      : null;
    const ageConfirmed = isChecked(data.ageConfirmed);
    const emailConsent = isChecked(data.emailConsent);
    const textConsent = isChecked(data.textConsent);

    if (!productName) {
      return NextResponse.json({ success: false, error: 'Please enter the product name' }, { status: 400 });
    }
    if (!customerName) {
      return NextResponse.json({ success: false, error: 'Please enter your name' }, { status: 400 });
    }
    if (data.email && !email) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 });
    }
    if (data.phone && !phone) {
      return NextResponse.json({ success: false, error: 'Please enter a valid 10-digit U.S. phone number' }, { status: 400 });
    }
    if (!contactPreference) {
      return NextResponse.json({ success: false, error: 'Please choose how we should contact you' }, { status: 400 });
    }
    if (!ageConfirmed) {
      return NextResponse.json({ success: false, error: 'You must confirm you are 21 or older' }, { status: 400 });
    }

    const hasEmailChannel = Boolean(email && emailConsent);
    const hasTextChannel = Boolean(phone && textConsent);
    if (contactPreference === 'email' && !hasEmailChannel) {
      return NextResponse.json(
        { success: false, error: 'Email contact requires a valid email and your consent to email you' },
        { status: 400 }
      );
    }
    if (contactPreference === 'text' && !hasTextChannel) {
      return NextResponse.json(
        { success: false, error: 'Text contact requires a valid phone number and your consent to a manual text' },
        { status: 400 }
      );
    }
    if (contactPreference === 'either' && !hasEmailChannel && !hasTextChannel) {
      return NextResponse.json(
        { success: false, error: 'Please provide an email and/or phone number and the matching consent' },
        { status: 400 }
      );
    }
    if (email && !emailConsent && (contactPreference === 'email' || contactPreference === 'either')) {
      return NextResponse.json(
        { success: false, error: 'Please agree to be contacted by email, or leave the email field blank' },
        { status: 400 }
      );
    }
    if (phone && !textConsent && (contactPreference === 'text' || contactPreference === 'either')) {
      return NextResponse.json(
        { success: false, error: 'Please agree to a manual text, or leave the phone field blank' },
        { status: 400 }
      );
    }

    if (requestTextIsBlocked(productName, brand, details)) {
      return NextResponse.json({ success: false, error: BLOCKED_REQUEST_MESSAGE }, { status: 400 });
    }

    const imagesResult = validateSubmittedImages(data.images, id);
    if (!imagesResult.ok) {
      return NextResponse.json({ success: false, error: imagesResult.error }, { status: 400 });
    }

    if (await productRequestExists(id)) {
      return NextResponse.json({ success: false, error: 'This request was already submitted' }, { status: 409 });
    }

    if (email && (await isRateLimited('request-email', email, RATE_LIMITS.requestPerEmail, RATE_LIMITS.windowSeconds))) {
      return NextResponse.json(
        { success: false, error: 'Too many requests from this email. Please try again later or call the store.' },
        { status: 429 }
      );
    }

    const record = await createProductRequest({
      id,
      productName,
      brand,
      details,
      images: imagesResult.images,
      customerName,
      email: email || undefined,
      phone,
      contactPreference,
      ageConfirmed: true,
      emailConsent: hasEmailChannel,
      textConsent: hasTextChannel,
      restrictedFlag: requestTextShouldFlag(productName, brand, details),
    });

    const staff = await sendProductRequestStaffEmail(record);
    if (!staff.ok) {
      console.error('Product-request staff email failed:', staff.error);
    }
    if (record.email && record.emailConsent) {
      const autoReply = await sendProductRequestAutoReply(record);
      if (!autoReply.ok) {
        console.error('Product-request auto-reply failed:', autoReply.error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product request submit failed:', error);
    return NextResponse.json(
      { success: false, error: 'We could not submit your request. Please call the store or email info@zsmokeshop.com.' },
      { status: 500 }
    );
  }
}
