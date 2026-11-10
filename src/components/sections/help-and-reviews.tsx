"use client";

import { Phone, X, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { getStoreStatus, hoursToLines } from "@/lib/store-hours";

type Location = ReturnType<ReturnType<typeof useBusinessSettings>["getActiveLocations"]>[number];

function mapEmbedUrl(location: Location) {
  return `https://www.google.com/maps?q=${encodeURIComponent(`${location.name}, ${location.address}`)}&output=embed`;
}

function directionsUrl(location: Location) {
  return (
    location.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.name}, ${location.address}`)}`
  );
}

function reviewsUrl(location: Location) {
  return (
    `https://www.google.com/search?q=${encodeURIComponent(`${location.name} ${location.address} reviews`)}`
  );
}

export default function HelpAndReviews() {
  const [showHoursPopup, setShowHoursPopup] = useState(false);
  const { getPrimaryPhone, getActiveLocations, loading } = useBusinessSettings();

  // Only locations that are checked (active) in Admin > Settings are shown.
  const activeLocations = getActiveLocations();
  const primaryLocation = activeLocations.find((loc) => loc.isPrimary) || activeLocations[0];
  const businessPhone = getPrimaryPhone();

  const handleCallStore = () => {
    // Uses the hours saved in settings, evaluated in store time (America/Chicago).
    // If the hours can't be parsed (isOpen === null), just place the call.
    const status = getStoreStatus(primaryLocation?.hours);
    if (status.isOpen === false) {
      setShowHoursPopup(true);
    } else {
      window.open(`tel:${businessPhone}`, '_self');
    }
  };

  const single = activeLocations.length === 1;

  return (
    <section className="min-h-[90vh] bg-white dark:bg-gray-900 flex flex-col justify-center py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
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
        {!loading && activeLocations.length > 0 && (
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight uppercase">
                {single ? 'Visit Our Store & See Reviews' : 'Visit Our Stores & See Reviews'}
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Find us on Google Maps and read authentic customer reviews
              </p>
            </div>

            {/* One card (map + info + links) per active location */}
            <div
              className={
                single
                  ? 'grid grid-cols-1 gap-10 max-w-3xl mx-auto'
                  : 'grid md:grid-cols-2 gap-10 md:gap-8 max-w-7xl mx-auto'
              }
            >
              {activeLocations.map((location) => {
                const [street, ...rest] = location.address.split(',');
                const cityLine = rest.join(',').trim();
                const hoursLines = hoursToLines(location.hours);
                return (
                  <div key={location.id} className="space-y-6">
                    <div className="relative w-full bg-gray-100 dark:bg-gray-800" style={{ paddingBottom: single ? '56.25%' : '75%' }}>
                      <iframe
                        src={mapEmbedUrl(location)}
                        className="absolute top-0 left-0 w-full h-full border-0"
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`${location.name} map`}
                      />
                    </div>

                    <div>
                      <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight uppercase">
                        {location.name}
                      </h3>
                      <div className="space-y-1 text-gray-700 dark:text-gray-300">
                        <p className="text-base font-medium">{street}</p>
                        {cityLine && <p className="text-base font-medium">{cityLine}</p>}
                        {location.phone && <p className="text-base font-medium mt-2">{location.phone}</p>}
                      </div>
                    </div>

                    {hoursLines.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">Hours</p>
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                          {hoursLines.map((line) => (
                            <p key={line}>{line}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <a
                        href={directionsUrl(location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                      >
                        Get Directions
                      </a>
                      <a
                        href={reviewsUrl(location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
                      >
                        Google Reviews
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
              {hoursToLines(primaryLocation?.hours).map((line) => (
                <p key={line}>{line}</p>
              ))}
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
