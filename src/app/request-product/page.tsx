import type { Metadata } from 'next';
import RequestProductForm from '@/components/inbox/RequestProductForm';
import { STORE_ADDRESS, STORE_PHONE_DISPLAY } from '@/lib/inbox-config';

export const metadata: Metadata = {
  title: 'Request a Product | Z Smoke Shop Austin',
  description:
    'Ask Z Smoke Shop to look for an item we do not currently carry. In-store pickup only, 21+ with valid ID. We do not sell or ship online.',
};

export default function RequestProductPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <section className="bg-black dark:bg-gray-900 text-white py-20">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-widest mb-6">Request a Product</h1>
            <div className="w-20 h-1 bg-white mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl font-light tracking-wide">
              Tell us what you&apos;re looking for and we&apos;ll see if we can get it for in-store pickup
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide max-w-3xl space-y-8">
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              This is a request, not an order. Z Smoke Shop does not sell, ship, or deliver anything online. If we can
              get the item, we will contact you and you can pick it up at {STORE_ADDRESS} with a valid ID showing you
              are 21 or older.
            </p>
            <p>
              We do not carry THC, delta-8, kratom, 7-OH, nitrous, or similar products, and we cannot accept requests
              for those items. Questions? Call us at {STORE_PHONE_DISPLAY}.
            </p>
          </div>
          <RequestProductForm />
        </div>
      </section>
    </div>
  );
}
