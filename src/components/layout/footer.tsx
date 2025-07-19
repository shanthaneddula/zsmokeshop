"use client";

import Link from "next/link";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Instagram, 
  Twitter, 
  Send 
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200">
      {/* Main Footer */}
      <div className="container-wide py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Z SMOKE SHOP</h3>
            <p className="text-sm text-gray-300">
              Your premier destination for quality smoke shop products and accessories in Austin, Texas. 
              Serving the community with excellence since day one.
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white transition-colors hover:bg-brand-600"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white transition-colors hover:bg-brand-600"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white transition-colors hover:bg-brand-600"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="inline-block text-gray-300 transition-colors hover:text-brand-400"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/shop" 
                  className="inline-block text-gray-300 transition-colors hover:text-brand-400"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="inline-block text-gray-300 transition-colors hover:text-brand-400"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href="/locations" 
                  className="inline-block text-gray-300 transition-colors hover:text-brand-400"
                >
                  Locations
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="inline-block text-gray-300 transition-colors hover:text-brand-400"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Locations & Hours */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Store Locations & Hours</h3>
            <div className="mb-4 space-y-2">
              <p className="font-medium text-white">Location 1</p>
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>719 W William Cannon Dr #105, Austin, TX 78745</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:(512) XXX-XXXX" className="hover:text-brand-400">(512) XXX-XXXX</a>
              </div>
              <div className="ml-6 mt-1 space-y-1 text-xs text-gray-400">
                <p className="font-medium">Store Hours</p>
                <p>Monday - Thursday: 10:00 AM - 10:00 PM</p>
                <p>Friday - Saturday: 10:00 AM - 11:00 PM</p>
                <p>Sunday: 11:00 AM - 9:00 PM</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium text-white">Location 2</p>
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>5318 Cameron Rd, Austin, TX 78723</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:(512) XXX-XXXX" className="hover:text-brand-400">(512) XXX-XXXX</a>
              </div>
              <div className="ml-6 mt-1 space-y-1 text-xs text-gray-400">
                <p className="font-medium">Store Hours</p>
                <p>Monday - Thursday: 10:00 AM - 10:00 PM</p>
                <p>Friday - Saturday: 10:00 AM - 11:00 PM</p>
                <p>Sunday: 11:00 AM - 9:00 PM</p>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Stay Updated</h3>
            <p className="mb-4 text-sm text-gray-300">
              Subscribe to our newsletter for exclusive deals, new product announcements, and special offers.
            </p>
            <form className="space-y-2">
              <div className="flex overflow-hidden rounded-lg bg-white/10 focus-within:ring-1 focus-within:ring-brand-500">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full border-0 bg-transparent px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-0"
                />
                <button 
                  type="submit" 
                  className="bg-brand-600 px-3 text-white transition-colors hover:bg-brand-700"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-400">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-black/20">
        <div className="container-wide flex flex-col items-center justify-between space-y-4 py-6 text-center text-sm text-gray-400 md:flex-row md:space-y-0 md:text-left">
          <div>
            © {currentYear} Z SMOKE SHOP. All rights reserved. | Licensed Tobacco Retailer
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/privacy" className="hover:text-brand-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand-400">Terms of Service</Link>
            <Link href="/age-verification" className="hover:text-brand-400">Age Verification</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}