"use client";

import { Phone, X, MessageCircle } from "lucide-react";
import { useState } from "react";



export default function HelpAndReviews() {
  const [showHoursPopup, setShowHoursPopup] = useState(false);

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
      window.open('tel:+1 (661) 371-1413', '_self');
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

        {/* Google Maps with Reviews Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-wide uppercase">
              Visit Our Store & See Reviews
            </h2>
            <div className="w-12 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Find us on Google Maps and read authentic customer reviews
            </p>
          </div>

          {/* Google Maps with Reviews - Responsive */}
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              {/* Desktop/Tablet View */}
              <div className="hidden md:block relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.4140832592784!2d-97.7885041!3d30.1967269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x865b4d6715b70a87%3A0x19df64376b6b2a4c!2sZ%20smoke%20shop!5e0!3m2!1sen!2sus!4v1756019395461!5m2!1sen!2sus&maptype=roadmap&zoom=15"
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Z Smoke Shop Location and Reviews"
                />
              </div>
              
              {/* Mobile View */}
              <div className="block md:hidden w-full">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.4140832592784!2d-97.7885041!3d30.1967269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x865b4d6715b70a87%3A0x19df64376b6b2a4c!2sZ%20smoke%20shop!5e0!3m2!1sen!2sus!4v1756019395461!5m2!1sen!2sus&maptype=roadmap&zoom=15"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Z Smoke Shop Location and Reviews"
                />
              </div>
            </div>
          </div>

          {/* External Links for Reviews */}
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="https://www.google.com/maps/place/Z+smoke+shop/@30.1967269,-97.7885041,17z/data=!4m8!3m7!1s0x865b4d6715b70a87:0x19df64376b6b2a4c!8m2!3d30.1967269!4d-97.7885041!9m1!1b1!16s%2Fg%2F11x13gx5kq?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 font-medium tracking-wide uppercase transition-all duration-300 hover:bg-blue-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              View on Google Maps
            </a>
            
            <a
              href="https://www.yelp.com/biz/z-smoke-shop-austin-2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 font-medium tracking-wide uppercase transition-all duration-300 hover:bg-red-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              Read Yelp Reviews
            </a>
          </div>

          {/* Store Information */}
          <div className="text-center mt-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-600 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                Store Location
              </h3>
              <p className="text-gray-700 dark:text-gray-200 mb-2">
                <strong>Address:</strong> 719 W William Cannon Dr, Unit 105, Austin, TX 78745
              </p>
              <p className="text-gray-700 dark:text-gray-200 mb-2">
                <strong>Phone:</strong> (661) 371-1413
              </p>
              <div className="text-gray-700 dark:text-gray-200">
                <strong>Hours:</strong>
                <div className="mt-2 text-sm">
                  <p>Mon-Thu, Sun: 10:00 AM - 11:00 PM</p>
                  <p>Fri-Sat: 10:00 AM - 12:00 AM</p>
                </div>
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
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <p><strong>Mon-Thu, Sun:</strong> 10:00 AM - 11:00 PM</p>
              <p><strong>Fri-Sat:</strong> 10:00 AM - 12:00 AM</p>
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
