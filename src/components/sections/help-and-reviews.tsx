"use client";

import { Phone, X, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

export default function HelpAndReviews() {
  const [showHoursPopup, setShowHoursPopup] = useState(false);
  const { getPrimaryPhone, getActiveLocations } = useBusinessSettings();

  // Get primary location or first active location
  const primaryLocation = getActiveLocations()[0];
  const businessPhone = getPrimaryPhone();

  // Check if store is currently open
  const isStoreOpen = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Friday (5) and Saturday (6): 10 AM - 12 AM (midnight)
    if (currentDay === 5 || currentDay === 6) {
      return currentHour >= 10 && currentHour < 24;
    }
    // Sunday (0), Monday (1), Tuesday (2), Wednesday (3), Thursday (4): 10 AM - 11 PM
    else {
      return currentHour >= 10 && currentHour < 23;
    }
  };

  const handleCallStore = () => {
    if (isStoreOpen()) {
      window.open(`tel:${businessPhone}`, '_self');
    } else {
      setShowHoursPopup(true);
    }
  };

  return (
    <section className="min-h-[90vh] bg-white dark:bg-gray-900 flex flex-col justify-center py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Need Help Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-wide uppercase">
            Need Help?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Our expert team is here to help you find the perfect products for your needs.
          </p>
          
          {/* Contact Options - Call and Chat Only */}
          <div className="flex justify-center gap-6">
            <button 
              onClick={handleCallStore}
              className="flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 font-medium tracking-wide uppercase transition-all duration-300 hover:bg-gray-800 dark:hover:bg-gray-100"
            >
              <Phone className="h-5 w-5" />
              Call Us
            </button>
            
            <button className="flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 font-medium tracking-wide uppercase transition-all duration-300 hover:bg-gray-800 dark:hover:bg-gray-100">
              <MessageCircle className="h-5 w-5" />
              Chat
            </button>
          </div>
        </div>

        {/* Visit Our Store & See Reviews Section */}
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight uppercase">
              Visit Our Store & See Reviews
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Find us on Google Maps and read authentic customer reviews
            </p>
          </div>

          {/* Two Maps Side by Side */}
          <div className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* Location 1: William Cannon - Map */}
            <div className="relative w-full bg-gray-100 dark:bg-gray-800" style={{ paddingBottom: '75%' }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.4140832592784!2d-97.7885041!3d30.1967269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x865b4d6715b70a87%3A0x19df64376b6b2a4c!2sZ%20smoke%20shop!5e0!3m2!1sen!2sus!4v1756019395461!5m2!1sen!2sus&maptype=roadmap&zoom=15"
                className="absolute top-0 left-0 w-full h-full border-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Z Smoke Shop - William Cannon Location"
              />
            </div>

            {/* Location 2: Cameron Rd - Map */}
            <div className="relative w-full bg-gray-100 dark:bg-gray-800" style={{ paddingBottom: '75%' }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3443.8632486916844!2d-97.6958!3d30.3037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644ca1a3c90d0c1%3A0x7c4e8c3f5b1a2e3d!2s5318%20Cameron%20Rd%2C%20Austin%2C%20TX%2078723!5e0!3m2!1sen!2sus!4v1756019395462!5m2!1sen!2sus&maptype=roadmap&zoom=15"
                className="absolute top-0 left-0 w-full h-full border-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="5 Star Smoke Shop - Cameron Rd Location"
              />
            </div>
          </div>

          {/* Store Information Below Maps - Adidas Style */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-7xl mx-auto">
            {/* Location 1: William Cannon - Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight uppercase">
                  {getActiveLocations()[0]?.name || 'Z SMOKE SHOP'}
                </h3>
                <div className="space-y-1 text-gray-700 dark:text-gray-300">
                  <p className="text-base font-medium">{getActiveLocations()[0]?.address.split(',')[0] || '719 W William Cannon Dr #105'}</p>
                  <p className="text-base font-medium">{getActiveLocations()[0]?.address.split(',').slice(1).join(',') || 'Austin, TX 78745'}</p>
                  <p className="text-base font-medium mt-2">{getActiveLocations()[0]?.phone || businessPhone}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">Hours</p>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                  <p>Mon-Thu, Sun: 10:00 AM - 11:00 PM</p>
                  <p>Fri-Sat: 10:00 AM - 12:00 AM</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <a
                  href="https://www.google.com/maps/place/Z+smoke+shop/@30.1967269,-97.7885041,17z/data=!4m8!3m7!1s0x865b4d6715b70a87:0x19df64376b6b2a4c!8m2!3d30.1967269!4d-97.7885041!9m1!1b1!16s%2Fg%2F11x13gx5kq?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Get Directions
                </a>
                <a
                  href="https://www.yelp.com/biz/z-smoke-shop-austin-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
                >
                  Read Reviews
                </a>
              </div>
            </div>

            {/* Location 2: Cameron Rd - Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight uppercase">
                  {getActiveLocations()[1]?.name || '5 STAR SMOKE SHOP & GIFTS'}
                </h3>
                <div className="space-y-1 text-gray-700 dark:text-gray-300">
                  <p className="text-base font-medium">{getActiveLocations()[1]?.address.split(',')[0] || '5318 Cameron Rd'}</p>
                  <p className="text-base font-medium">{getActiveLocations()[1]?.address.split(',').slice(1).join(',') || 'Austin, TX 78723'}</p>
                  <p className="text-base font-medium mt-2">{getActiveLocations()[1]?.phone || '(661) 371-1413'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">Hours</p>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                  <p>Mon-Thu, Sun: 10:00 AM - 11:00 PM</p>
                  <p>Fri-Sat: 10:00 AM - 12:00 AM</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <a
                  href="https://www.google.com/maps/place/5318+Cameron+Rd,+Austin,+TX+78723/@30.3037,-97.6958,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Get Directions
                </a>
                <a
                  href="https://www.yelp.com/search?find_desc=5+star+smoke+shop&find_loc=5318+Cameron+Rd%2C+Austin%2C+TX+78723"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
                >
                  Read Reviews
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Hours Popup */}
      {showHoursPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 max-w-sm w-full border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                Store Hours
              </h3>
              <button
                onClick={() => setShowHoursPopup(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">
              {primaryLocation?.hours || 'Mon-Thu, Sun: 10:00 AM - 11:00 PM\nFri-Sat: 10:00 AM - 12:00 AM'}
            </div>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-300">
              We&apos;re currently closed. Please call during business hours.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
