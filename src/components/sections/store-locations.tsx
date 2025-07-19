"use client";

import { MapPin, Phone, Clock, Navigation, ExternalLink } from "lucide-react";

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  features: string[];
  image: string;
}

const storeLocations: StoreLocation[] = [
  {
    id: "south-austin",
    name: "South Austin",
    address: "719 W William Cannon Dr #105, Austin, TX 78745",
    phone: "(512) 555-0123",
    hours: "10:00 AM - 10:00 PM Daily",
    coordinates: {
      lat: 30.2241,
      lng: -97.7889
    },
    features: ["Drive-thru Available", "Large Parking Lot", "Wheelchair Accessible"],
    image: "/api/placeholder/400/250"
  },
  {
    id: "east-austin",
    name: "East Austin",
    address: "5318 Cameron Rd, Austin, TX 78723",
    phone: "(512) 555-0124",
    hours: "10:00 AM - 10:00 PM Daily",
    coordinates: {
      lat: 30.2969,
      lng: -97.6947
    },
    features: ["Extended Hours", "Expert Staff", "Premium Selection"],
    image: "/api/placeholder/400/250"
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
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Visit Our Stores
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Two convenient locations in Austin, TX to serve you with premium products and expert advice
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {storeLocations.map((location) => (
            <div
              key={location.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              {/* Store Image */}
              <div className="relative h-48 bg-gradient-to-br from-brand-500 to-accent-600 overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-80" />
                    <h3 className="text-2xl font-bold">{location.name}</h3>
                    <p className="text-sm opacity-90">Z Smoke Shop Location</p>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full blur-lg"></div>
              </div>

              {/* Store Info */}
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {location.name} Location
                  </h3>
                  
                  {/* Address */}
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="h-5 w-5 text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {location.address}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3 mb-4">
                    <Phone className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                    <button
                      onClick={() => callStore(location.phone)}
                      className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
                    >
                      {location.phone}
                    </button>
                  </div>

                  {/* Hours */}
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      {location.hours}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                      Store Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {location.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-200"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => openInMaps(location.address)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    Get Directions
                  </button>
                  
                  <button
                    onClick={() => callStore(location.phone)}
                    className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call Store
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Can&apos;t Visit In Person?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Browse our complete selection online and enjoy convenient delivery or curbside pickup options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                <ExternalLink className="h-4 w-4" />
                Shop Online
              </button>
              <button className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-lg transition-colors">
                Learn About Delivery
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
