/**
 * Twilio SMS Service for Pickup Order Notifications
 * Handles all SMS communications with customers and store staff
 */

import { Communication, StoreLocation } from '@/types/orders';

// Store location details
const STORE_LOCATIONS = {
  'william-cannon': {
    name: 'Z SMOKE SHOP',
    address: '719 W William Cannon Dr #105',
    city: 'Austin, TX 78745',
    phone: process.env.STORE_PHONE_WILLIAM_CANNON || '',
  },
  'cameron-rd': {
    name: 'Z SMOKE SHOP',
    address: '5318 Cameron Rd',
    city: 'Austin, TX 78723',
    phone: process.env.STORE_PHONE_CAMERON_RD || '',
  },
};

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

/**
 * Get Twilio configuration from environment
 */
function getTwilioConfig(): TwilioConfig {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !phoneNumber) {
    throw new Error('Twilio configuration missing. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in environment variables.');
  }

  return { accountSid, authToken, phoneNumber };
}

/**
 * Format phone number to E.164 format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add +1 for US numbers if not present
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  // Already formatted or international
  if (phone.startsWith('+')) {
    return phone;
  }
  
  return `+${cleaned}`;
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
 * Send SMS via Twilio
 */
async function sendSMS(to: string, message: string): Promise<Communication> {
  const config = getTwilioConfig();
  const formattedTo = formatPhoneNumber(to);

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: config.phoneNumber,
          To: formattedTo,
          Body: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Twilio error: ${data.message || 'Unknown error'}`);
    }

    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      direction: 'to-customer',
      message,
      method: 'sms',
      status: 'sent',
      twilioMessageSid: data.sid,
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      direction: 'to-customer',
      message,
      method: 'sms',
      status: 'failed',
    };
  }
}

/**
 * Send order confirmation SMS to customer
 */
export async function sendOrderConfirmationSMS(
  customerPhone: string,
  orderNumber: string,
  location: StoreLocation,
  estimatedReadyTime: Date
): Promise<Communication> {
  const store = STORE_LOCATIONS[location];
  const readyTime = formatTime(estimatedReadyTime);
  
  const message = `Z SMOKE SHOP: Order ${orderNumber} received! We'll prepare your items and text you when ready for pickup (est. ${readyTime}). Must pick up within 1 hour. ${store.address}`;

  return sendSMS(customerPhone, message);
}

/**
 * Send order notification SMS to store
 */
export async function sendStoreNotificationSMS(
  location: StoreLocation,
  orderNumber: string,
  customerName: string,
  itemCount: number,
  total: number
): Promise<Communication> {
  const storePhone = STORE_LOCATIONS[location].phone;
  
  if (!storePhone) {
    console.warn(`No phone number configured for location: ${location}`);
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      direction: 'to-store',
      message: 'Store phone not configured',
      method: 'sms',
      status: 'failed',
    };
  }

  const message = `NEW ORDER ${orderNumber}: ${customerName} - ${itemCount} item(s) - $${total.toFixed(2)}. Check admin dashboard to confirm.`;

  const communication = await sendSMS(storePhone, message);
  return {
    ...communication,
    direction: 'to-store',
  };
}

/**
 * Send order ready for pickup SMS to customer
 */
export async function sendOrderReadySMS(
  customerPhone: string,
  orderNumber: string,
  location: StoreLocation,
  pickupDeadline: Date
): Promise<Communication> {
  const store = STORE_LOCATIONS[location];
  const deadlineTime = formatTime(pickupDeadline);
  
  const message = `Z SMOKE SHOP: Order ${orderNumber} is READY for pickup! Please arrive by ${deadlineTime} (within 1 hour). ${store.address}. Reply HELP if you need assistance.`;

  return sendSMS(customerPhone, message);
}

/**
 * Send replacement suggestion SMS to customer
 */
export async function sendReplacementSuggestionSMS(
  customerPhone: string,
  orderNumber: string,
  unavailableProduct: string,
  replacementProduct: string
): Promise<Communication> {
  const message = `Z SMOKE SHOP Order ${orderNumber}: "${unavailableProduct}" is out of stock. Can we substitute with "${replacementProduct}"? Reply YES to approve or NO to remove from order.`;

  return sendSMS(customerPhone, message);
}

/**
 * Send order cancelled SMS to customer
 */
export async function sendOrderCancelledSMS(
  customerPhone: string,
  orderNumber: string,
  reason?: string
): Promise<Communication> {
  const message = reason
    ? `Z SMOKE SHOP: Order ${orderNumber} has been cancelled. Reason: ${reason}. Call us if you have questions.`
    : `Z SMOKE SHOP: Order ${orderNumber} has been cancelled. Call us if you have questions.`;

  return sendSMS(customerPhone, message);
}

/**
 * Send pickup reminder SMS (15 minutes before deadline)
 */
export async function sendPickupReminderSMS(
  customerPhone: string,
  orderNumber: string,
  location: StoreLocation,
  minutesRemaining: number
): Promise<Communication> {
  const store = STORE_LOCATIONS[location];
  
  const message = `Z SMOKE SHOP: Reminder - Order ${orderNumber} must be picked up within ${minutesRemaining} minutes or it will be cancelled. ${store.address}`;

  return sendSMS(customerPhone, message);
}

/**
 * Send no-show notification SMS to customer
 */
export async function sendNoShowSMS(
  customerPhone: string,
  orderNumber: string
): Promise<Communication> {
  const message = `Z SMOKE SHOP: Order ${orderNumber} was not picked up within the 1-hour window and has been cancelled. Please place a new order if still interested.`;

  return sendSMS(customerPhone, message);
}

/**
 * Send generic notification SMS
 */
export async function sendNotificationSMS(
  phoneNumber: string,
  message: string,
  direction: 'to-customer' | 'to-store' = 'to-customer'
): Promise<Communication> {
  const communication = await sendSMS(phoneNumber, message);
  return {
    ...communication,
    direction,
  };
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Should be 10 digits (US) or 11 digits (with country code)
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
}

/**
 * Parse incoming SMS from Twilio webhook
 */
export interface IncomingSMS {
  from: string;
  to: string;
  body: string;
  messageSid: string;
  timestamp: Date;
}

export function parseIncomingSMS(twilioWebhookData: Record<string, string>): IncomingSMS {
  return {
    from: twilioWebhookData.From || '',
    to: twilioWebhookData.To || '',
    body: twilioWebhookData.Body || '',
    messageSid: twilioWebhookData.MessageSid || '',
    timestamp: new Date(),
  };
}

/**
 * Detect if incoming SMS is a replacement approval
 */
export function isReplacementApproval(messageBody: string): boolean {
  const normalized = messageBody.toLowerCase().trim();
  return normalized === 'yes' || normalized === 'y' || normalized === 'approve' || normalized === 'ok';
}

/**
 * Detect if incoming SMS is a replacement rejection
 */
export function isReplacementRejection(messageBody: string): boolean {
  const normalized = messageBody.toLowerCase().trim();
  return normalized === 'no' || normalized === 'n' || normalized === 'reject' || normalized === 'cancel';
}

/**
 * Get store location info
 */
export function getStoreLocationInfo(location: StoreLocation) {
  return STORE_LOCATIONS[location];
}
