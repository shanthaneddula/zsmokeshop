import { Resend } from 'resend';
import { STORE_ADDRESS, STORE_PHONE_DISPLAY } from '@/lib/inbox-config';
import { getContactInboxEmail } from '@/lib/inbox-env';
import type { ContactMessage, ProductRequest } from '@/types/inbox';

export type InboxEmailResult = { ok: true; emailId?: string } | { ok: false; error: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrap(title: string, body: string): string {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;line-height:1.5">
  <h2 style="margin:0 0 16px;text-transform:uppercase;letter-spacing:1px">${escapeHtml(title)}</h2>
  ${body}
  <p style="margin-top:28px;font-size:13px;color:#555">
    Z Smoke Shop<br>
    ${escapeHtml(STORE_ADDRESS)}<br>
    ${escapeHtml(STORE_PHONE_DISPLAY)}
  </p>
  <p style="font-size:12px;color:#777">21+ only. Catalog and requests are for in-store pickup. We do not sell, ship, or deliver online. Valid ID required at purchase.</p>
</div>`;
}

async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<InboxEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'Email is not configured' };
  }
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'orders@zsmokeshop.com';
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: `Z Smoke Shop <${fromEmail}>`,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true, emailId: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    console.error('Inbox email failed:', message);
    return { ok: false, error: message };
  }
}

export async function sendContactStaffEmail(message: ContactMessage): Promise<InboxEmailResult> {
  const inbox = getContactInboxEmail();
  const html = wrap(
    'New contact message',
    `<p><strong>From:</strong> ${escapeHtml(message.name)} &lt;${escapeHtml(message.email)}&gt;</p>
     ${message.phone ? `<p><strong>Phone:</strong> ${escapeHtml(message.phone)}</p>` : ''}
     <p><strong>Subject:</strong> ${escapeHtml(message.subject)}</p>
     <p style="white-space:pre-wrap">${escapeHtml(message.message)}</p>
     <p style="font-size:13px;color:#555">Open in admin: <a href="https://www.zsmokeshop.com/admin/messages">/admin/messages</a></p>`
  );
  return sendMail({
    to: inbox,
    subject: `Contact form: ${message.subject}`,
    html,
    replyTo: message.email,
  });
}

export async function sendContactAutoReply(message: ContactMessage): Promise<InboxEmailResult> {
  const html = wrap(
    'We received your message',
    `<p>Hi ${escapeHtml(message.name)},</p>
     <p>Thanks for contacting Z Smoke Shop. We received your message about &quot;${escapeHtml(message.subject)}&quot; and will get back to you by email.</p>
     <p>If you need us sooner, call ${escapeHtml(STORE_PHONE_DISPLAY)} or visit us at ${escapeHtml(STORE_ADDRESS)}. Please bring a valid ID if you plan to purchase (21+ only).</p>`
  );
  return sendMail({
    to: message.email,
    subject: 'We received your message — Z Smoke Shop',
    html,
    replyTo: getContactInboxEmail(),
  });
}

export async function sendProductRequestStaffEmail(request: ProductRequest): Promise<InboxEmailResult> {
  const inbox = getContactInboxEmail();
  const flag = request.restrictedFlag
    ? '<p style="color:#92400E;background:#FEF3C7;padding:10px 12px"><strong>Flagged for review:</strong> this request mentions a hemp/CBD-related term. Confirm it is a legal THC-free item before sourcing.</p>'
    : '';
  const html = wrap(
    'New product request',
    `${flag}
     <p><strong>Product:</strong> ${escapeHtml(request.productName)}${request.brand ? ` — ${escapeHtml(request.brand)}` : ''}</p>
     ${request.details ? `<p style="white-space:pre-wrap">${escapeHtml(request.details)}</p>` : ''}
     <p><strong>Customer:</strong> ${escapeHtml(request.customerName)}</p>
     ${request.email ? `<p><strong>Email:</strong> ${escapeHtml(request.email)}</p>` : ''}
     ${request.phone ? `<p><strong>Phone:</strong> ${escapeHtml(request.phone)}</p>` : ''}
     <p><strong>Contact preference:</strong> ${escapeHtml(request.contactPreference)}</p>
     <p><strong>Images:</strong> ${request.images.length}</p>
     <p style="font-size:13px;color:#555">Open in admin: <a href="https://www.zsmokeshop.com/admin/product-requests">/admin/product-requests</a></p>`
  );
  return sendMail({
    to: inbox,
    subject: `Product request: ${request.productName}`,
    html,
    replyTo: request.email,
  });
}

export async function sendProductRequestAutoReply(request: ProductRequest): Promise<InboxEmailResult> {
  if (!request.email) return { ok: false, error: 'No email on file' };
  const html = wrap(
    'We received your product request',
    `<p>Hi ${escapeHtml(request.customerName)},</p>
     <p>Thanks for your request for <strong>${escapeHtml(request.productName)}</strong>${request.brand ? ` (${escapeHtml(request.brand)})` : ''}. Our team will look into whether we can get it for in-store pickup.</p>
     <p>This is not an order. We do not sell, ship, or deliver online. If we can get the item, we will contact you and you can pick it up at ${escapeHtml(STORE_ADDRESS)} with a valid ID (21+).</p>
     <p>If you have questions, call ${escapeHtml(STORE_PHONE_DISPLAY)}.</p>`
  );
  return sendMail({
    to: request.email,
    subject: 'We received your product request — Z Smoke Shop',
    html,
    replyTo: getContactInboxEmail(),
  });
}

export async function sendProductRequestCustomerEmail(
  request: ProductRequest,
  subject: string,
  body: string
): Promise<InboxEmailResult> {
  if (!request.email) return { ok: false, error: 'No email on file' };
  const html = wrap(
    subject,
    `<p>Hi ${escapeHtml(request.customerName)},</p>
     <p style="white-space:pre-wrap">${escapeHtml(body)}</p>`
  );
  return sendMail({
    to: request.email,
    subject,
    html,
    replyTo: getContactInboxEmail(),
  });
}

export { defaultCustomerEmailTemplate, defaultManualTextMessage } from '@/lib/inbox-templates';
