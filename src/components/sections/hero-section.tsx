"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useBanner } from "@/contexts/BannerContext";

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
  const { isVisible: isBannerVisible } = useBanner();

  // Update store status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setStoreStatus(getStoreStatus());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[85vh] max-h-screen bg-black flex items-center overflow-hidden">
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

      {/* Enhanced overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50 z-5"></div>

      {/* Fallback Background (if video doesn't load) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-0"></div>

      {/* Main Content - Account for banner and header spacing */}
      <div className="container-wide relative z-10 w-full">
        <div className={`flex items-center justify-center min-h-screen ${
          isBannerVisible ? 'pt-[7rem] md:pt-[8rem]' : 'pt-[4rem]'
        }`}>
          {/* Centered Content */}
          <motion.div 
            className="space-y-6 md:space-y-8 text-center px-4 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >

            {/* Main Headline */}
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-none drop-shadow-2xl">
                Z SMOKE SHOP
              </h1>
              <div className="w-16 md:w-20 h-1 bg-white shadow-lg mx-auto"></div>
            </div>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-gray-100 leading-relaxed max-w-2xl lg:max-w-3xl drop-shadow-lg px-2">
              Your trusted destination for quality smoking accessories, vapes, and CBD products.
            </p>

            {/* CTA Buttons - Enhanced hierarchy */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-white text-black px-8 md:px-10 py-4 md:py-5 text-sm md:text-base font-black hover:bg-gray-100 transition-all duration-300 uppercase tracking-wider shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                Shop Now
              </Link>
              <Link
                href="/locations"
                className="inline-flex items-center justify-center border-2 border-white/80 px-8 md:px-10 py-4 md:py-5 text-sm md:text-base font-black text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-wider shadow-2xl"
              >
                Find Store
              </Link>
            </div>

            {/* Store Status - Enhanced visibility with banner-aware spacing */}
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base pt-6 opacity-95 ${
              isBannerVisible ? 'pb-24 sm:pb-8' : 'pb-20 sm:pb-6'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 ${storeStatus.statusColor} rounded-full shadow-xl animate-pulse`}></div>
                <span className="text-white font-bold uppercase tracking-wider">{storeStatus.statusText}</span>
              </div>
              <div className="text-gray-200 uppercase tracking-wider font-medium">
                {storeStatus.todayHours}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator - Banner-aware positioning */}
      <motion.div 
        className={`absolute left-0 right-0 z-10 flex justify-center ${
          isBannerVisible ? 'bottom-4 sm:bottom-6 md:bottom-8' : 'bottom-2 sm:bottom-8 md:bottom-12'
        }`}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center gap-1 sm:gap-2 md:gap-3 text-white/80 hover:text-white transition-colors cursor-pointer">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest drop-shadow-lg">Scroll Down</span>
          <div className="w-0.5 h-6 sm:h-8 md:h-12 bg-white/70 shadow-xl"></div>
          <motion.div 
            className="w-2 h-2 bg-white rounded-full shadow-xl"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}