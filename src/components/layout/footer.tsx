"use client";

import Link from "next/link";
import { 
  MapPin, 
  Phone, 
  Facebook, 
  Instagram, 
  Twitter
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 dark:bg-black text-white">
      {/* Main Footer Content */}
      <div className="container-wide py-16">
        <div className="space-y-8">
          {/* Brand Section with Social Icons */}
          <div className="text-center space-y-4">
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide">Z SMOKE SHOP</h3>
            <div className="w-12 h-0.5 bg-white mx-auto"></div>
            <p className="text-sm font-light text-gray-300 max-w-xl mx-auto uppercase tracking-wide">
              Austin&apos;s premier destination for quality smoke shop products
            </p>
            <div className="flex justify-center space-x-4 pt-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 border border-white/30 flex items-center justify-center hover:border-white hover:bg-white hover:text-gray-900 transition-all"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 border border-white/30 flex items-center justify-center hover:border-white hover:bg-white hover:text-gray-900 transition-all"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 border border-white/30 flex items-center justify-center hover:border-white hover:bg-white hover:text-gray-900 transition-all"
                aria-label="Twitter"
              >
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links in Row */}
          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <Link 
                href="/" 
                className="text-sm font-light text-gray-300 hover:text-white transition-colors uppercase tracking-wide"
              >
                Home
              </Link>
              <Link 
                href="/shop" 
                className="text-sm font-light text-gray-300 hover:text-white transition-colors uppercase tracking-wide"
              >
                Shop All
              </Link>
              <Link 
                href="/contact" 
                className="text-sm font-light text-gray-300 hover:text-white transition-colors uppercase tracking-wide"
              >
                Contact
              </Link>
              <Link 
                href="/locations" 
                className="text-sm font-light text-gray-300 hover:text-white transition-colors uppercase tracking-wide"
              >
                Locations
              </Link>
            </div>
          </div>

          {/* Store Info and Newsletter in Two Columns */}
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Store Info */}
            <div className="text-center md:text-left">
              <h4 className="text-base font-bold text-white uppercase tracking-wide mb-4">Store Info</h4>
              <div className="space-y-3">
                <div className="flex items-start justify-center md:justify-start gap-3 text-sm text-gray-300">
                  <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
                  <span className="font-light leading-relaxed">719 W William Cannon Dr #105<br />Austin, TX 78745</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-gray-300">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a href="tel:(661) 371-1413" className="hover:text-white transition-colors font-light">(661) 371-1413</a>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Hours</p>
                  <div className="space-y-1 text-xs font-light text-gray-300">
                    <p>Mon-Thu, Sun: 10AM-11PM</p>
                    <p>Fri-Sat: 10AM-12AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="text-center md:text-left">
              <h4 className="text-base font-bold text-white uppercase tracking-wide mb-4">Stay Updated</h4>
              <p className="mb-4 text-sm font-light text-gray-300 leading-relaxed">
                Get exclusive deals and product updates
              </p>
              <form className="space-y-4">
                <div className="flex border border-white/30 focus-within:border-white max-w-sm mx-auto md:mx-0">
                  <input
                    type="email"
                    placeholder="Enter email"
                    className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:outline-none text-sm font-light"
                  />
                  <button 
                    type="submit" 
                    className="bg-white text-gray-900 px-4 py-3 font-bold hover:bg-gray-100 transition-colors uppercase tracking-wide text-xs"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/30">
        <div className="container-wide flex flex-col items-center justify-between space-y-3 py-4 text-center text-xs text-gray-400 md:flex-row md:space-y-0 md:text-left">
          <div className="font-light">
            © {currentYear} Z SMOKE SHOP. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors font-light uppercase tracking-wide">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors font-light uppercase tracking-wide">Terms</Link>
            <Link href="/age-verification" className="hover:text-white transition-colors font-light uppercase tracking-wide">Age Verification</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}