import { NextRequest, NextResponse } from 'next/server';
import { RATE_LIMITS } from '@/lib/inbox-config';
import { getClientIp, isRateLimited } from '@/lib/inbox-rate-limit';
import { createContactMessage } from '@/lib/contact-storage';
import { sendContactAutoReply, sendContactStaffEmail } from '@/lib/inbox-email';
import {
  cleanText,
  isChecked,
  isHoneypotTriggered,
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

    // Bots that fill the hidden field get a fake success and nothing is stored.
    if (isHoneypotTriggered((body as { website?: unknown }).website)) {
      return NextResponse.json({ success: true });
    }

    const ip = getClientIp(request.headers);
    if (await isRateLimited('contact-ip', ip, RATE_LIMITS.contactPerIp, RATE_LIMITS.windowSeconds)) {
      return NextResponse.json(
        { success: false, error: 'Too many messages. Please try again later or call the store.' },
        { status: 429 }
      );
    }

    const name = cleanText((body as { name?: unknown }).name, 100);
    const email = requireEmail((body as { email?: unknown }).email);
    const phone = normalizePhone((body as { phone?: unknown }).phone);
    const subject = cleanText((body as { subject?: unknown }).subject, 150);
    const message = multilineText((body as { message?: unknown }).message, 5000);
    const ageConfirmed = isChecked((body as { ageConfirmed?: unknown }).ageConfirmed);
    const emailConsent = isChecked((body as { emailConsent?: unknown }).emailConsent);

    if (!name) return NextResponse.json({ success: false, error: 'Please enter your name' }, { status: 400 });
    if (!email) return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 });
    if ((body as { phone?: unknown }).phone && !phone) {
      return NextResponse.json({ success: false, error: 'Please enter a valid 10-digit U.S. phone number' }, { status: 400 });
    }
    if (!subject) return NextResponse.json({ success: false, error: 'Please enter a subject' }, { status: 400 });
    if (!message) return NextResponse.json({ success: false, error: 'Please enter a message' }, { status: 400 });
    if (!ageConfirmed) {
      return NextResponse.json({ success: false, error: 'You must confirm you are 21 or older' }, { status: 400 });
    }
    if (!emailConsent) {
      return NextResponse.json(
        { success: false, error: 'Please agree to be contacted by email about this message' },
        { status: 400 }
      );
    }

    if (await isRateLimited('contact-email', email, RATE_LIMITS.contactPerEmail, RATE_LIMITS.windowSeconds)) {
      return NextResponse.json(
        { success: false, error: 'Too many messages from this email. Please try again later or call the store.' },
        { status: 429 }
      );
    }

    const record = await createContactMessage({
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      subject,
      message,
      ageConfirmed: true,
      emailConsent: true,
    });

    const staff = await sendContactStaffEmail(record);
    if (!staff.ok) {
      console.error('Contact staff email failed:', staff.error);
    }
    const autoReply = await sendContactAutoReply(record);
    if (!autoReply.ok) {
      console.error('Contact auto-reply failed:', autoReply.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form submit failed:', error);
    return NextResponse.json(
      { success: false, error: 'We could not send your message. Please call the store or email info@zsmokeshop.com.' },
      { status: 500 }
    );
  }
}
