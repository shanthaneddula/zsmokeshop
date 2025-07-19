'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { locations } from '@/data';

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
          >
            Our Locations
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-center text-purple-100"
          >
            Visit us at either of our convenient Austin locations
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Locations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Location Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6">
                <h2 className="text-2xl font-bold mb-2">
                  Z SMOKE SHOP - Store {location.id}
                </h2>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-purple-100">Austin, Texas</span>
                </div>
              </div>

              {/* Location Details */}
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Address</h3>
                      <p className="text-gray-600">{location.address}</p>
                    </div>
                  </div>

                  {location.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-6 h-6 text-purple-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Phone</h3>
                        <a 
                          href={`tel:${location.phone}`}
                          className="text-purple-600 hover:text-purple-700 transition-colors"
                        >
                          {location.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {location.hours && (
                    <div className="flex items-start space-x-3">
                      <Clock className="w-6 h-6 text-purple-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Hours</h3>
                        <p className="text-gray-600">{location.hours}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(location.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-center flex items-center justify-center"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </a>
                  {location.phone && (
                    <a
                      href={`tel:${location.phone}`}
                      className="flex-1 border border-purple-600 text-purple-600 py-3 px-4 rounded-lg hover:bg-purple-50 transition-colors font-medium text-center flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Store
                    </a>
                  )}
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="h-48 bg-gray-200 flex items-center justify-center border-t">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Interactive Map Coming Soon</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Why Choose Z SMOKE SHOP?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Convenient Locations
              </h3>
              <p className="text-gray-600">
                Two accessible locations in Austin to serve you better
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Extended Hours
              </h3>
              <p className="text-gray-600">
                Open 7 days a week with convenient hours for your schedule
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Expert Support
              </h3>
              <p className="text-gray-600">
                Knowledgeable staff ready to help with all your questions
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
