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
    <section className="py-12 md:py-16 bg-white dark:bg-gray-900">
      <div className="container-wide w-full">
        {/* Centered header - matching other sections */}
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            OUR LOCATIONS
          </h2>
          <div className="w-12 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-4"></div>
          <p className="hidden md:block text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light uppercase tracking-wide">
            Two Austin locations serving premium products
          </p>
        </div>
        
        {/* Mobile-optimized grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 max-w-6xl mx-auto">
          {storeLocations.map((location, index) => (
            <div
              key={location.id}
              className="group"
            >
              {/* Store number indicator - hidden on mobile */}
              <div className="hidden md:flex items-center mb-2 md:mb-4">
                <span className="text-2xl md:text-4xl font-black text-gray-200 dark:text-gray-700 mr-2 md:mr-4">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>

              {/* Store name - larger typography */}
              <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-4 md:mb-6 tracking-tight leading-tight">
                {location.name}
              </h3>

              {/* Essential information - larger spacing */}
              <div className="space-y-4 md:space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3 md:gap-4">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-base md:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                    {location.address}
                  </p>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 md:gap-4">
                  <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <button
                    onClick={() => callStore(location.phone)}
                    className="text-base md:text-base text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors underline-offset-4 hover:underline"
                  >
                    {location.phone}
                  </button>
                </div>

                {/* Hours - larger display */}
                <div className="flex items-start gap-3 md:gap-4">
                  <Clock className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="text-base md:text-base text-gray-700 dark:text-gray-300 font-light">
                    <p className="mb-1">{location.hours.weekdays}</p>
                    <p>{location.hours.weekends}</p>
                  </div>
                </div>

                {/* Features - hidden on mobile */}
                <div className="hidden md:flex flex-wrap gap-1 md:gap-2 pt-1 md:pt-2">
                  {location.features.map((feature, featureIndex) => (
                    <span
                      key={featureIndex}
                      className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600 pb-0.5 md:pb-1"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action button - larger size */}
              <div className="mt-6 md:mt-6 flex justify-center md:justify-stretch">
                <button
                  onClick={() => openInMaps(location.address)}
                  className="w-auto md:w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 md:py-3 px-8 md:px-6 transition-all duration-300 hover:bg-gray-800 dark:hover:bg-gray-100 group-hover:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </button>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
