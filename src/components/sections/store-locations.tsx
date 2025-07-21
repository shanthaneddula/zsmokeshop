"use client";

import { MapPin, Phone, Clock, Navigation } from "lucide-react";

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: {
    weekdays: string;
    weekends: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  features: string[];
}

const storeLocations: StoreLocation[] = [
  {
    id: "z-smoke-shop",
    name: "Z SMOKE SHOP",
    address: "719 W William Cannon Dr #105, Austin, TX 78745",
    phone: "+1 (661) 371-1413",
    hours: {
      weekdays: "Mon-Thu, Sun: 10:00 AM - 11:00 PM",
      weekends: "Fri-Sat: 10:00 AM - 12:00 AM"
    },
    coordinates: {
      lat: 30.2241,
      lng: -97.7889
    },
    features: ["Large Parking", "Wheelchair Accessible", "Expert Staff", "Premium Selection"]
  },
  {
    id: "five-star-smoke-shop",
    name: "5 STAR SMOKE SHOP & GIFTS",
    address: "5318 Cameron Rd, Austin, TX 78723",
    phone: "+1 (661) 371-1413",
    hours: {
      weekdays: "Mon-Thu, Sun: 10:00 AM - 11:00 PM",
      weekends: "Fri-Sat: 10:00 AM - 12:00 AM"
    },
    coordinates: {
      lat: 30.2969,
      lng: -97.6947
    },
    features: ["Large Parking", "Wheelchair Accessible", "Expert Staff", "Premium Selection"]
  }
];

export default function StoreLocations() {
  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  };

  const callStore = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <section className="min-h-[90vh] flex flex-col justify-center py-16 bg-gray-100 dark:bg-gray-850">
      <div className="container-wide">
        {/* Minimalist header - Adidas style */}
        <div className="mb-20">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            LOCATIONS
          </h2>
          <div className="w-16 h-1 bg-gray-900 dark:bg-white mb-8"></div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl font-light">
            Two Austin locations serving premium products with expert guidance
          </p>
        </div>
        
        {/* Clean grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {storeLocations.map((location, index) => (
            <div
              key={location.id}
              className="group"
            >
              {/* Store number indicator */}
              <div className="flex items-center mb-6">
                <span className="text-6xl font-black text-gray-200 dark:text-gray-700 mr-6">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>

              {/* Store name - bold typography */}
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
                {location.name}
              </h3>

              {/* Essential information - clean spacing */}
              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                    {location.address}
                  </p>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <button
                    onClick={() => callStore(location.phone)}
                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors underline-offset-4 hover:underline"
                  >
                    {location.phone}
                  </button>
                </div>

                {/* Hours - structured display */}
                <div className="flex items-start gap-4">
                  <Clock className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="text-gray-700 dark:text-gray-300 font-light">
                    <p className="mb-1">{location.hours.weekdays}</p>
                    <p>{location.hours.weekends}</p>
                  </div>
                </div>

                {/* Features - minimal tags */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {location.features.map((feature, featureIndex) => (
                    <span
                      key={featureIndex}
                      className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600 pb-1"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Single primary action - Adidas style */}
              <button
                onClick={() => openInMaps(location.address)}
                className="mt-8 w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 px-8 transition-all duration-300 hover:bg-gray-800 dark:hover:bg-gray-100 group-hover:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </button>
            </div>
          ))}
        </div>

        {/* Minimal call-to-action */}
        <div className="mt-24 text-center max-w-2xl mx-auto">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-16">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              NEED HELP?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 font-light text-lg">
              Call for expert product advice and information
            </p>
            <button 
              onClick={() => callStore("+1 (661) 371-1413")}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 py-4 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors inline-flex items-center gap-3 uppercase tracking-wider text-sm"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
