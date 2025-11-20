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

        {/* Store Locations Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-wide uppercase">
              Visit Our Stores
            </h2>
            <div className="w-12 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Two convenient locations in Austin to serve you better
            </p>
          </div>

          {/* Two Locations Side by Side */}
          <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Location 1: William Cannon */}
            <div className="space-y-4">
              {/* Store Info */}
              <div className="bg-gray-50 dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                  Z SMOKE SHOP
                </h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-200">
                  <p>
                    <strong>Address:</strong><br />
                    719 W William Cannon Dr #105<br />
                    Austin, TX 78745
                  </p>
                  <p>
                    <strong>Phone:</strong> (512) 766-3707
                  </p>
                  <div>
                    <strong>Hours:</strong>
                    <div className="mt-1 text-sm">
                      Mon-Thu, Sun: 10:00 AM - 11:00 PM<br />
                      Fri-Sat: 10:00 AM - 12:00 AM
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Map */}
              <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.4140832592784!2d-97.7885041!3d30.1967269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x865b4d6715b70a87%3A0x19df64376b6b2a4c!2sZ%20smoke%20shop!5e0!3m2!1sen!2sus!4v1756019395461!5m2!1sen!2sus&maptype=roadmap&zoom=15"
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Z Smoke Shop - William Cannon Location"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <a
                  href="https://www.google.com/maps/place/Z+smoke+shop/@30.1967269,-97.7885041,17z/data=!4m8!3m7!1s0x865b4d6715b70a87:0x19df64376b6b2a4c!8m2!3d30.1967269!4d-97.7885041!9m1!1b1!16s%2Fg%2F11x13gx5kq?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:bg-blue-700"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Directions
                </a>
                <a
                  href="https://www.yelp.com/biz/z-smoke-shop-austin-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:bg-red-700"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                  Reviews
                </a>
              </div>
            </div>

            {/* Location 2: Cameron Rd */}
            <div className="space-y-4">
              {/* Store Info */}
              <div className="bg-gray-50 dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                  5 STAR SMOKE SHOP & GIFTS
                </h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-200">
                  <p>
                    <strong>Address:</strong><br />
                    5318 Cameron Rd<br />
                    Austin, TX 78723
                  </p>
                  <p>
                    <strong>Phone:</strong> (661) 371-1413
                  </p>
                  <div>
                    <strong>Hours:</strong>
                    <div className="mt-1 text-sm">
                      Mon-Thu, Sun: 10:00 AM - 11:00 PM<br />
                      Fri-Sat: 10:00 AM - 12:00 AM
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Map */}
              <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3443.8632486916844!2d-97.6958!3d30.3037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644ca1a3c90d0c1%3A0x7c4e8c3f5b1a2e3d!2s5318%20Cameron%20Rd%2C%20Austin%2C%20TX%2078723!5e0!3m2!1sen!2sus!4v1756019395462!5m2!1sen!2sus&maptype=roadmap&zoom=15"
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="5 Star Smoke Shop - Cameron Rd Location"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <a
                  href="https://www.google.com/maps/place/5318+Cameron+Rd,+Austin,+TX+78723/@30.3037,-97.6958,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:bg-blue-700"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Directions
                </a>
                <a
                  href="https://www.yelp.com/search?find_desc=5+star+smoke+shop&find_loc=5318+Cameron+Rd%2C+Austin%2C+TX+78723"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:bg-red-700"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                  Reviews
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
