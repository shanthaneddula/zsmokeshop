/**
 * Resend Email Service for Pickup Order Notifications
 * Handles all email communications with customers and store staff
 */

import { Resend } from 'resend';
import { Communication, StoreLocation } from '@/types/orders';

// Store location details
const STORE_LOCATIONS = {
  'william-cannon': {
    name: 'Z SMOKE SHOP',
    address: '719 W William Cannon Dr #105',
    city: 'Austin, TX 78745',
    phone: process.env.STORE_PHONE_WILLIAM_CANNON || '',
    email: process.env.STORE_EMAIL_WILLIAM_CANNON || 'williamcannon@zsmokeshop.com',
  },
  'cameron-rd': {
    name: 'Z SMOKE SHOP',
    address: '5318 Cameron Rd',
    city: 'Austin, TX 78723',
    phone: process.env.STORE_PHONE_CAMERON_RD || '',
    email: process.env.STORE_EMAIL_CAMERON_RD || 'cameron@zsmokeshop.com',
  },
};

/**
 * Get Resend instance
 */
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Resend API key missing. Please set RESEND_API_KEY in environment variables.');
  }

  return new Resend(apiKey);
}

/**
 * Format time for display (e.g., "3:30 PM")
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date for display (e.g., "Nov 19, 2025")
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Send email via Resend
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<Communication> {
  const resend = getResendClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'orders@zsmokeshop.com';

  try {
    const { data, error } = await resend.emails.send({
      from: `Z SMOKE SHOP <${fromEmail}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      direction: 'to-customer',
      message: subject,
      method: 'email',
      status: 'sent',
      emailId: data?.id,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      direction: 'to-customer',
      message: subject,
      method: 'email',
      status: 'failed',
    };
  }
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  location: StoreLocation,
  estimatedReadyTime: Date,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number
): Promise<Communication> {
  const store = STORE_LOCATIONS[location];
  const readyTime = formatTime(estimatedReadyTime);
  const readyDate = formatDate(estimatedReadyTime);

  const itemsList = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Z SMOKE SHOP</h1>
              <p style="margin: 10px 0 0 0; color: #cccccc; font-size: 14px;">Order Confirmation</p>
            </td>
          </tr>
          
          <!-- Success Message -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f0fdf4;">
              <div style="display: inline-block; background-color: #10b981; color: white; border-radius: 50%; width: 50px; height: 50px; line-height: 50px; font-size: 24px; margin-bottom: 15px;">✓</div>
              <h2 style="margin: 0 0 10px 0; color: #065f46; font-size: 24px;">Order Received!</h2>
              <p style="margin: 0; color: #047857; font-size: 16px;">We're preparing your items now</p>
            </td>
          </tr>
          
          <!-- Order Details -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">Hi ${customerName},</p>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 14px;">Thank you for your order! We'll send you another email when your items are ready for pickup.</p>
              
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 10px;">
                      <strong style="color: #111827;">Order Number:</strong>
                      <span style="color: #1f2937; font-size: 18px; font-weight: bold; display: block; margin-top: 5px;">${orderNumber}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 10px;">
                      <strong style="color: #111827;">Estimated Ready Time:</strong>
                      <span style="color: #1f2937; display: block; margin-top: 5px;">${readyTime} on ${readyDate}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong style="color: #111827;">Pickup Location:</strong>
                      <span style="color: #1f2937; display: block; margin-top: 5px;">${store.name}<br>${store.address}<br>${store.city}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Order Items -->
              <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px;">Order Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 10px; text-align: left; color: #374151; font-weight: 600;">Item</th>
                    <th style="padding: 10px; text-align: center; color: #374151; font-weight: 600;">Qty</th>
                    <th style="padding: 10px; text-align: right; color: #374151; font-weight: 600;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 15px 8px 8px 8px; text-align: right; font-weight: 600; color: #111827; border-top: 2px solid #e5e7eb;">Total:</td>
                    <td style="padding: 15px 8px 8px 8px; text-align: right; font-weight: 600; color: #111827; font-size: 18px; border-top: 2px solid #e5e7eb;">$${total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              
              <!-- Important Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>⏰ Important:</strong> You must pick up your order within 1 hour of receiving the "ready" notification, or it will be cancelled.</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Questions? Contact us at ${store.phone}</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2025 Z SMOKE SHOP. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const subject = `Order ${orderNumber} Confirmed - Z SMOKE SHOP`;
  return sendEmail(customerEmail, subject, html);
}

/**
 * Send order ready for pickup email to customer
 */
export async function sendOrderReadyEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  location: StoreLocation,
  pickupDeadline: Date
): Promise<Communication> {
  const store = STORE_LOCATIONS[location];
  const deadlineTime = formatTime(pickupDeadline);
  const deadlineDate = formatDate(pickupDeadline);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Z SMOKE SHOP</h1>
              <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 14px;">Order Ready!</p>
            </td>
          </tr>
          
          <!-- Ready Message -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <div style="display: inline-block; background-color: #10b981; color: white; border-radius: 50%; width: 60px; height: 60px; line-height: 60px; font-size: 30px; margin-bottom: 15px;">🎉</div>
              <h2 style="margin: 0 0 10px 0; color: #065f46; font-size: 26px;">Your Order is Ready!</h2>
              <p style="margin: 0 0 5px 0; color: #047857; font-size: 18px; font-weight: 600;">Order ${orderNumber}</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Come pick it up at your convenience</p>
            </td>
          </tr>
          
          <!-- Pickup Details -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">Hi ${customerName},</p>
              
              <div style="background-color: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #065f46; font-size: 18px;">📍 Pickup Location</h3>
                <p style="margin: 0 0 5px 0; color: #047857; font-weight: 600; font-size: 16px;">${store.name}</p>
                <p style="margin: 0 0 5px 0; color: #065f46;">${store.address}</p>
                <p style="margin: 0 0 15px 0; color: #065f46;">${store.city}</p>
                <p style="margin: 0; color: #065f46;"><strong>Phone:</strong> ${store.phone}</p>
              </div>
              
              <!-- Deadline Warning -->
              <div style="background-color: #fef2f2; border: 2px solid #ef4444; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #991b1b; font-size: 18px;">⏰ Pick Up By</h3>
                <p style="margin: 0 0 5px 0; color: #7f1d1d; font-size: 20px; font-weight: bold;">${deadlineTime}</p>
                <p style="margin: 0 0 15px 0; color: #991b1b;">${deadlineDate}</p>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px;"><strong>Important:</strong> Orders not picked up within 1 hour will be automatically cancelled.</p>
              </div>
              
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">Please bring your ID for age verification</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Questions? Contact us at ${store.phone}</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2025 Z SMOKE SHOP. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const subject = `🎉 Order ${orderNumber} Ready for Pickup - Z SMOKE SHOP`;
  return sendEmail(customerEmail, subject, html);
}

/**
 * Send order cancelled email to customer
 */
export async function sendOrderCancelledEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  reason?: string
): Promise<Communication> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Z SMOKE SHOP</h1>
              <p style="margin: 10px 0 0 0; color: #fecaca; font-size: 14px;">Order Cancelled</p>
            </td>
          </tr>
          
          <!-- Cancellation Message -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">Hi ${customerName},</p>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 14px;">Your order <strong>${orderNumber}</strong> has been cancelled.</p>
              ${
                reason
                  ? `<div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
                  <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> ${reason}</p>
                </div>`
                  : ''
              }
              <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">If you have any questions or would like to place a new order, please don't hesitate to contact us.</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2025 Z SMOKE SHOP. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const subject = `Order ${orderNumber} Cancelled - Z SMOKE SHOP`;
  return sendEmail(customerEmail, subject, html);
}

/**
 * Send store notification email about new order
 */
export async function sendStoreNotificationEmail(
  location: StoreLocation,
  orderNumber: string,
  customerName: string,
  customerContact: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  notificationMethod: 'email' | 'sms'
): Promise<Communication> {
  const store = STORE_LOCATIONS[location];
  const storeEmail = store.email;

  const itemsList = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🔔 NEW ORDER</h1>
              <p style="margin: 10px 0 0 0; color: #dbeafe; font-size: 18px; font-weight: bold;">${orderNumber}</p>
            </td>
          </tr>
          
          <!-- Order Details -->
          <tr>
            <td style="padding: 30px;">
              <div style="background-color: #eff6ff; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #1e40af;">Customer Information</h3>
                <p style="margin: 0 0 10px 0; color: #1e3a8a;"><strong>Name:</strong> ${customerName}</p>
                <p style="margin: 0 0 10px 0; color: #1e3a8a;"><strong>Contact (${notificationMethod.toUpperCase()}):</strong> ${customerContact}</p>
                <p style="margin: 0; color: #1e3a8a;"><strong>Location:</strong> ${store.name} - ${store.address}</p>
              </div>
              
              <!-- Order Items -->
              <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px;">Order Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 10px; text-align: left; color: #374151; font-weight: 600;">Item</th>
                    <th style="padding: 10px; text-align: center; color: #374151; font-weight: 600;">Qty</th>
                    <th style="padding: 10px; text-align: right; color: #374151; font-weight: 600;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 15px 8px 8px 8px; text-align: right; font-weight: 600; color: #111827; border-top: 2px solid #e5e7eb;">Total:</td>
                    <td style="padding: 15px 8px 8px 8px; text-align: right; font-weight: 600; color: #111827; font-size: 18px; border-top: 2px solid #e5e7eb;">$${total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Action Required:</strong> Check the admin dashboard to confirm and prepare this order.</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2025 Z SMOKE SHOP Store Notification</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const subject = `🔔 NEW ORDER ${orderNumber} - ${customerName} - $${total.toFixed(2)}`;
  
  const communication = await sendEmail(storeEmail, subject, html);
  return {
    ...communication,
    direction: 'to-store',
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get store location info
 */
export function getStoreLocationInfo(location: StoreLocation) {
  return STORE_LOCATIONS[location];
}
