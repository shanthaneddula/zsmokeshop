import type {
  ContactPreference,
  ContactStatus,
  ProductRequestStatus,
} from '@/lib/inbox-config';

export type { ContactPreference, ContactStatus, ProductRequestStatus };

export interface InboxNote {
  id: string;
  at: string;
  by: string;
  text: string;
}

export interface InboxTimelineEvent {
  id: string;
  at: string;
  by: string;
  type: 'created' | 'status' | 'note' | 'emailed' | 'texted';
  detail: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  ageConfirmed: boolean;
  emailConsent: boolean;
  status: ContactStatus;
  notes: InboxNote[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface ProductRequestImage {
  pathname: string;
  url: string;
  contentType: string;
  size: number;
  devMock?: boolean;
}

export interface ProductRequest {
  id: string;
  productName: string;
  brand?: string;
  details?: string;
  images: ProductRequestImage[];
  customerName: string;
  email?: string;
  phone?: string;
  contactPreference: ContactPreference;
  ageConfirmed: boolean;
  emailConsent: boolean;
  textConsent: boolean;
  restrictedFlag: boolean;
  status: ProductRequestStatus;
  notes: InboxNote[];
  timeline: InboxTimelineEvent[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  lastEmailedAt?: string;
  lastTextedAt?: string;
}
