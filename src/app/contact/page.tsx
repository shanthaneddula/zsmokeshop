import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Z Smoke Shop - Austin, TX',
  description: 'Get in touch with Z Smoke Shop in Austin, Texas. Visit our store, call us, or send us a message for all your smoking and vaping needs.',
  keywords: 'contact Z Smoke Shop, Austin smoke shop, tobacco store Austin, vape shop contact',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-black dark:bg-gray-900 text-white py-20">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-widest mb-6">
              CONTACT
            </h1>
            <div className="w-20 h-1 bg-white mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl font-light tracking-wide">
              Get in touch with Z Smoke Shop
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Store Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-6">
                  VISIT OUR STORE
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Address</h3>
                    <p>123 Main Street<br />Austin, TX 78701</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Phone</h3>
                    <p>(512) 555-0123</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Email</h3>
                    <p>info@zsmokeshop.com</p>
                  </div>
                </div>
              </div>

              {/* Store Hours */}
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-white mb-4">
                  STORE HOURS
                </h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Monday - Saturday</span>
                    <span>10:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>12:00 PM - 8:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-6">
                SEND MESSAGE
              </h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent resize-none"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-black dark:bg-white text-white dark:text-black px-8 py-4 font-bold uppercase tracking-wide border border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
