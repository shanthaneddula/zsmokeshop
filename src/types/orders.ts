/**
 * Order Management Types for Z SMOKE SHOP Pickup Orders
 * Supports SMS notifications via Twilio and 1-hour pickup window
 */

export type OrderStatus = 
  | 'pending'           // Order placed, awaiting store confirmation
  | 'confirmed'         // Store confirmed, checking inventory
  | 'ready'             // Ready for pickup (1-hour window starts)
  | 'picked-up'         // Customer picked up and paid
  | 'no-show'           // Customer didn't pick up within 1 hour
  | 'cancelled';        // Order cancelled

export type ReplacementPreference = 
  | 'substitute'        // Accept similar substitute
  | 'refund'            // Refund if unavailable
  | 'call-me';          // Contact me to discuss

export type StoreLocation = 
  | 'william-cannon'    // 719 W William Cannon Dr #105, Austin, TX 78745
  | 'cameron-rd';       // 5318 Cameron Rd, Austin, TX 78723

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  category: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  replacementPreference: ReplacementPreference;
  // If item was replaced
  replacementProductId?: string;
  replacementProductName?: string;
  replacementApprovedAt?: string; // ISO timestamp
  wasReplaced?: boolean;
}

export interface Communication {
  id: string;
  timestamp: string; // ISO timestamp
  direction: 'to-customer' | 'to-store' | 'from-customer' | 'from-store';
  message: string;
  method: 'sms' | 'email' | 'web' | 'system';
  status?: 'sent' | 'delivered' | 'failed';
  twilioMessageSid?: string;
  emailId?: string;
}

export interface OrderTimeline {
  placedAt: string;       // When order was created
  confirmedAt?: string;   // When store confirmed
  readyAt?: string;       // When marked ready for pickup
  pickupDeadline?: string; // readyAt + 1 hour
  completedAt?: string;   // When picked up or marked no-show
  cancelledAt?: string;   // If cancelled
}

export interface PickupOrder {
  id: string;                    // Unique UUID
  orderNumber: string;           // Human-readable (e.g., "ZS-001234")
  
  // Customer info
  customerName: string;
  customerPhone: string;         // E.164 format: +15125551234
  customerEmail?: string;        // Email address (if using email notifications)
  notificationMethod: 'sms' | 'email'; // Customer's preferred notification method
  
  // Order details
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  
  // Store info
  storeLocation: StoreLocation;
  
  // Status tracking
  status: OrderStatus;
  timeline: OrderTimeline;
  
  // Communications
  communications: Communication[];
  
  // Notes
  customerNotes?: string;
  storeNotes?: string;           // Internal notes from staff
  
  // Metadata
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notificationMethod: 'sms' | 'email';
  items: Array<{
    productId: string;
    quantity: number;
    replacementPreference: ReplacementPreference;
  }>;
  storeLocation: StoreLocation;
  customerNotes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  storeNotes?: string;
}

export interface SuggestReplacementRequest {
  orderItemIndex: number;        // Which item to replace
  replacementProductId: string;
  replacementProductName: string;
}

export interface OrderFilters {
  status?: OrderStatus | OrderStatus[];
  storeLocation?: StoreLocation;
  dateFrom?: string;             // ISO date
  dateTo?: string;               // ISO date
  searchQuery?: string;          // Search by order number, customer name, phone
}

export interface OrderStats {
  today: {
    total: number;
    pending: number;
    ready: number;
    pickedUp: number;
    noShow: number;
  };
  thisWeek: {
    total: number;
    pickedUp: number;
    noShow: number;
  };
  byLocation: {
    [key in StoreLocation]: number;
  };
}

// Helper type for order list display
export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  itemCount: number;
  total: number;
  storeLocation: StoreLocation;
  createdAt: string;
  pickupDeadline?: string;
  timeRemaining?: number; // Minutes remaining for pickup
  isExpiringSoon?: boolean; // Less than 15 minutes remaining
}

// SMS Templates
export interface SMSTemplate {
  orderConfirmation: (orderNumber: string, location: string, pickupTime: string) => string;
  storeNotification: (orderNumber: string, customerName: string, itemCount: number, total: number) => string;
  orderReady: (orderNumber: string, location: string, deadline: string) => string;
  replacementSuggestion: (productName: string, replacementName: string, orderNumber: string) => string;
  orderCancelled: (orderNumber: string) => string;
  pickupReminder: (orderNumber: string, minutesRemaining: number) => string;
  noShow: (orderNumber: string) => string;
}
