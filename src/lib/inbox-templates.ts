import { STORE_ADDRESS, STORE_PHONE_DISPLAY } from '@/lib/inbox-config';
import type { ProductRequest } from '@/types/inbox';

export function defaultCustomerEmailTemplate(request: ProductRequest): { subject: string; body: string } {
  const item = request.brand ? `${request.productName} (${request.brand})` : request.productName;
  if (request.status === 'arrived' || request.status === 'notified') {
    return {
      subject: `Your requested item is in the store — Z Smoke Shop`,
      body: `The ${item} you requested is in the store and ready for pickup at ${STORE_ADDRESS}. Please bring a valid ID showing you are 21 or older. We do not ship or hold this as an online sale — pickup is in person only.\n\nQuestions? Call us at ${STORE_PHONE_DISPLAY}.`,
    };
  }
  if (request.status === 'closed') {
    return {
      subject: `Update on your product request — Z Smoke Shop`,
      body: `We were not able to get the ${item} you requested. You are welcome to call us at ${STORE_PHONE_DISPLAY} if you have questions or want to ask about something else. Thank you for reaching out.`,
    };
  }
  if (request.status === 'ordered' || request.status === 'sourcing') {
    return {
      subject: `Update on your product request — Z Smoke Shop`,
      body: `We are working on your request for ${item}. We will let you know when we have a further update. If we can get it, you can pick it up in store at ${STORE_ADDRESS} with a valid ID (21+).\n\nQuestions? Call ${STORE_PHONE_DISPLAY}.`,
    };
  }
  return {
    subject: `Your product request — Z Smoke Shop`,
    body: `Thanks again for requesting ${item}. We wanted to follow up. If you have questions, call ${STORE_PHONE_DISPLAY}. Pickup, if we can get the item, is in store only with a valid ID (21+).`,
  };
}

export function defaultManualTextMessage(request: ProductRequest): string {
  const item = request.productName;
  const name = request.customerName.split(' ')[0] || request.customerName;
  if (request.status === 'arrived' || request.status === 'notified') {
    return `Hi ${name}, this is Z Smoke Shop. The ${item} you requested is in the store and ready for pickup at ${STORE_ADDRESS}. Please bring a valid ID (21+). Reply STOP to opt out.`;
  }
  if (request.status === 'closed') {
    return `Hi ${name}, this is Z Smoke Shop. We weren't able to get the ${item} you requested. Call us at ${STORE_PHONE_DISPLAY} with questions. Reply STOP to opt out.`;
  }
  if (request.status === 'ordered' || request.status === 'sourcing') {
    return `Hi ${name}, this is Z Smoke Shop. We're working on your request for ${item} and will update you when we know more. Reply STOP to opt out.`;
  }
  return `Hi ${name}, this is Z Smoke Shop following up on your request for ${item}. Call us at ${STORE_PHONE_DISPLAY} if you have questions. Reply STOP to opt out.`;
}
