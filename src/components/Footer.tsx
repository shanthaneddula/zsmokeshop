import Link from 'next/link';
import { MapPin, Phone, Clock, Twitter, Facebook, Instagram } from 'lucide-react';
import { locations } from '@/data';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-full">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold text-xl inline-block mb-6 shadow-lg">
              Z SMOKE SHOP
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your premier destination for quality smoke shop products and accessories in Austin, Texas. Serving the community with excellence since day one.
            </p>
            <div className="flex flex-row space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-all duration-300 inline-flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full">
                <Twitter size={20} strokeWidth={2} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-all duration-300 inline-flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full">
                <Facebook size={20} strokeWidth={2} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-all duration-300 inline-flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full">
                <Instagram size={20} strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 group-hover:bg-purple-400 transition-colors"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 group-hover:bg-purple-400 transition-colors"></span>
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 group-hover:bg-purple-400 transition-colors"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/locations" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 group-hover:bg-purple-400 transition-colors"></span>
                  Locations
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 flex items-center group">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 group-hover:bg-purple-400 transition-colors"></span>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Locations & Hours */}
          <div className="lg:col-span-2 max-w-full">
            <h3 className="text-xl font-bold mb-6 text-white">Store Locations & Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-full">
              {locations.map((location) => (
                <div key={location.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors duration-300">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium mb-1">Location {location.id}</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {location.address}
                        </p>
                      </div>
                    </div>
                    {location.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-purple-400" />
                        <a href={`tel:${location.phone}`} className="text-gray-300 text-sm hover:text-purple-400 transition-colors">
                          {location.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-start space-x-3">
                      <Clock className="w-4 h-4 text-purple-400 mt-1" />
                      <div>
                        <p className="text-white font-medium mb-2">Store Hours</p>
                        <div className="text-gray-300 text-sm space-y-1">
                          <p>Monday - Thursday: 10:00 AM - 10:00 PM</p>
                          <p>Friday - Saturday: 10:00 AM - 11:00 PM</p>
                          <p>Sunday: 11:00 AM - 9:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-8 border border-purple-500/30">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive deals, new product announcements, and special offers.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Z SMOKE SHOP. All rights reserved. | Licensed Tobacco Retailer
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="/age-verification" className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-300">
                Age Verification
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
