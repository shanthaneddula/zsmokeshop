'use client';

import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { locations } from '@/data';
import { Location } from '@/types';

// Extended interface for locations page with additional features
interface ExtendedLocation extends Location {
  coordinates?: {
    lat: number;
    lng: number;
  };
  features?: string[];
}

// Extend the shared locations data with additional features for this page
const extendedLocations: ExtendedLocation[] = [
  {
    ...locations[0],
    coordinates: {
      lat: 30.2241,
      lng: -97.7889
    },
    features: ["Large Parking", "Wheelchair Accessible", "Expert Staff", "Premium Selection"]
  },
  {
    ...locations[1],
    coordinates: {
      lat: 30.2969,
      lng: -97.6947
    },
    features: ["Large Parking", "Wheelchair Accessible", "Expert Staff", "Premium Selection"]
  }
];

export default function LocationsPage() {
  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  };

  const callStore = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-[6.7rem]">
      {/* Clean header - Better proportions */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="container-wide">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight uppercase">
              LOCATIONS
            </h1>
            <div className="w-16 h-0.5 bg-gray-900 dark:bg-white mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl font-light">
              Two Austin locations serving premium products with expert guidance
            </p>
          </div>
          
          {/* Clean grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {extendedLocations.map((location, index) => (
              <div
                key={location.id}
                className="group"
              >
                {/* Store number indicator */}
                <div className="flex items-center mb-6">
                  <span className="text-4xl font-black text-gray-200 dark:text-gray-700 mr-4">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                </div>

                {/* Store name - bold typography */}
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight uppercase">
                  {location.name}
                </h2>

                {/* Essential information - clean spacing */}
                <div className="space-y-5">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                      {location.address}
                    </p>
                  </div>

                  {/* Phone */}
                  {location.phone && (
                    <div className="flex items-center gap-4">
                      <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <button
                        onClick={() => callStore(location.phone!)}
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors underline-offset-4 hover:underline"
                      >
                        {location.phone}
                      </button>
                    </div>
                  )}

                  {/* Hours - structured display */}
                  <div className="flex items-start gap-4">
                    <div className="flex items-start gap-4">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-gray-700 dark:text-gray-300 font-light">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{location.hours}</p>
                      </div>
                    </div>
                  </div>

                  {/* Features - minimal tags */}
                  <div className="flex flex-wrap gap-3 pt-3">
                    {location.features?.map((feature, featureIndex) => (
                      <span
                        key={featureIndex}
                        className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600 pb-0.5"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Single primary action - Adidas style */}
                <button
                  onClick={() => openInMaps(location.address)}
                  className="mt-8 w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 px-6 transition-all duration-300 hover:bg-gray-800 dark:hover:bg-gray-100 flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </button>
              </div>
            ))}
          </div>

          {/* Minimal call-to-action */}
          <div className="mt-20 text-center max-w-xl mx-auto">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-16">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight uppercase">
                NEED HELP?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 font-light">
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
      </div>
    </div>
  );
}
