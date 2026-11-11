import { redirect } from 'next/navigation';

// No online sales: all purchases happen in store (21+, ID required).
export default function CheckoutPage() {
  redirect('/shop');
}
