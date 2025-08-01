"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Helper function to check if store is currently open
function getStoreStatus() {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // Convert to minutes

  // Get day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayName = dayNames[currentDay];

  // Store hours: Mon-Thu, Sun: 10AM-11PM | Fri-Sat: 10AM-12AM
  let openTime, closeTime, todayHours;
  
  if (currentDay === 0 || (currentDay >= 1 && currentDay <= 4)) {
    // Sunday or Monday-Thursday: 10AM-11PM
    openTime = 10 * 60; // 10:00 AM in minutes
    closeTime = 23 * 60; // 11:00 PM in minutes
    todayHours = `${currentDayName}: 10:00AM - 11:00PM`;
  } else {
    // Friday-Saturday: 10AM-12AM (midnight)
    openTime = 10 * 60; // 10:00 AM in minutes
    closeTime = 24 * 60; // 12:00 AM (midnight) in minutes
    todayHours = `${currentDayName}: 10:00AM - 12:00AM`;
  }

  const isOpen = currentTime >= openTime && currentTime < closeTime;
  
  return {
    isOpen,
    todayHours,
    statusText: isOpen ? "Open Now" : "Closed",
    statusColor: isOpen ? "bg-green-400" : "bg-red-400"
  };
}

export default function HeroSection() {
  const [storeStatus, setStoreStatus] = useState(getStoreStatus());

  // Update store status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setStoreStatus(getStoreStatus());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] bg-black flex items-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log('Video failed to load:', e);
            e.currentTarget.style.display = 'none';
          }}
        >
          <source src="/videos/smoke-background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-black/30 z-5"></div>

      {/* Fallback Background (if video doesn't load) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-0"></div>

      {/* Main Content */}
      <div className="container-wide relative z-10">
        <div className="flex items-center justify-center min-h-[60vh] pt-8">
          {/* Centered Content */}
          <motion.div 
            className="space-y-6 md:space-y-8 text-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >

            {/* Main Headline */}
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white uppercase leading-none drop-shadow-lg">
                Z SMOKE SHOP
              </h1>
              <div className="w-12 md:w-16 h-0.5 bg-white shadow-lg mx-auto"></div>
            </div>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-gray-200 leading-relaxed max-w-xl lg:max-w-2xl drop-shadow-md px-2">
              Your trusted destination for quality smoking accessories, vapes, and CBD products.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-row gap-3 md:gap-4 justify-center pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center border-2 border-white px-4 sm:px-6 md:px-8 py-2.5 md:py-3 text-xs sm:text-sm font-bold text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-wide shadow-lg hover:shadow-xl"
              >
                Shop Now
              </Link>
              <Link
                href="/locations"
                className="inline-flex items-center justify-center border-2 border-white/50 px-4 sm:px-6 md:px-8 py-2.5 md:py-3 text-xs sm:text-sm font-bold text-white hover:border-white hover:bg-white/10 transition-all duration-300 uppercase tracking-wide shadow-lg"
              >
                Find Store
              </Link>
            </div>

            {/* Store Status - Dynamic based on current time */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm pt-4 opacity-90">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${storeStatus.statusColor} rounded-full shadow-lg`}></div>
                <span className="text-gray-300 font-medium uppercase tracking-wide">{storeStatus.statusText}</span>
              </div>
              <div className="text-gray-400 uppercase tracking-wide">
                {storeStatus.todayHours}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <motion.div 
        className="absolute bottom-6 md:bottom-8 left-0 right-0 z-10 flex justify-center"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center gap-1.5 md:gap-2 text-white/70">
          <span className="text-xs font-medium uppercase tracking-wider drop-shadow-md">Scroll</span>
          <div className="w-px h-6 md:h-8 bg-white/50 shadow-lg"></div>
        </div>
      </motion.div>
    </section>
  );
}