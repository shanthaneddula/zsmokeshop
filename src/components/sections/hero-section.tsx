"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Pause, Play } from "lucide-react";
import { useBanner } from "@/contexts/BannerContext";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { getStoreStatus, type StoreStatus } from "@/lib/store-hours";

export default function HeroSection() {
  const { isVisible: isBannerVisible } = useBanner();
  const { getActiveLocations, loading } = useBusinessSettings();

  // Hours come from Admin > Settings (primary / first active location).
  const activeLocations = getActiveLocations();
  const primaryHours = (activeLocations.find((loc) => loc.isPrimary) || activeLocations[0])?.hours;

  // Computed on the client only (in store time, America/Chicago) to avoid hydration mismatches.
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);

  // Background video: not downloaded until age is verified, and not auto-loaded
  // on mobile / reduced-motion / save-data (the 1.4MB file dominated PageSpeed bytes).
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoPaused, setVideoPaused] = useState(true);

  const shouldAutoLoadVideo = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const saveData = Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    );
    return !reduced && !mobile && !saveData;
  };

  const loadAndPlayVideo = () => {
    setVideoSrc('/videos/smoke-background.mp4');
    setVideoPaused(false);
  };

  useEffect(() => {
    const maybeLoad = () => {
      if (sessionStorage.getItem('ageVerified') !== 'true') return;
      if (!shouldAutoLoadVideo()) return;
      loadAndPlayVideo();
    };

    maybeLoad();
    window.addEventListener('ageVerified', maybeLoad);
    return () => window.removeEventListener('ageVerified', maybeLoad);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc || videoPaused) return;
    video.play().catch(() => setVideoPaused(true));
  }, [videoSrc, videoPaused]);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!videoSrc) {
      loadAndPlayVideo();
      return;
    }
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setVideoPaused(false);
    } else {
      video.pause();
      setVideoPaused(true);
    }
  };

  useEffect(() => {
    if (loading) return;
    const update = () => setStoreStatus(primaryHours ? getStoreStatus(primaryHours) : null);
    update();
    const interval = setInterval(update, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [loading, primaryHours]);

  return (
    <section className="relative min-h-[85vh] max-h-screen bg-black flex items-center overflow-hidden">
      {/* Fallback background is visible immediately so first paint does not wait on the video */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />

      {/* Video Background — source is attached only after the age gate (and not on mobile by default) */}
      {videoSrc && (
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            aria-hidden="true"
            tabIndex={-1}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            src={videoSrc}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Enhanced overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50 z-[1]"></div>

      {/* Main Content - Account for banner and header spacing */}
      <div className="container-wide relative z-10 w-full">
        <div className={`flex items-center justify-center min-h-screen ${
          isBannerVisible ? 'pt-[7rem] md:pt-[8rem]' : 'pt-[4rem]'
        }`}>
          {/* Centered Content */}
          <motion.div 
            className="space-y-6 md:space-y-8 text-center px-4 max-w-4xl mx-auto"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
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
              Your trusted Austin destination for quality glass, hookah, rolling supplies and smoke shop accessories. 21+ only.
            </p>

            {/* CTA Buttons - Enhanced hierarchy */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-white text-black px-8 md:px-10 py-4 md:py-5 text-sm md:text-base font-black hover:bg-gray-100 transition-all duration-300 uppercase tracking-wider shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                Browse Catalog
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
              {storeStatus?.statusText && (
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${storeStatus.isOpen ? "bg-green-400" : "bg-red-400"} rounded-full shadow-xl animate-pulse`}></div>
                  <span className="text-white font-bold uppercase tracking-wider">{storeStatus.statusText}</span>
                </div>
              )}
              {storeStatus?.todayHours && (
                <div className="text-gray-200 uppercase tracking-wider font-medium">
                  {storeStatus.todayHours}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pause/play control for the background video */}
      <button
        type="button"
        onClick={toggleVideo}
        aria-label={videoSrc && !videoPaused ? 'Pause background video' : 'Play background video'}
        aria-pressed={Boolean(videoSrc) && !videoPaused}
        className="absolute right-3 bottom-3 sm:right-6 sm:bottom-6 z-20 flex h-10 w-10 items-center justify-center border border-white/70 bg-black/60 text-white hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {videoSrc && !videoPaused ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
      </button>

      {/* Enhanced Scroll Indicator - Banner-aware positioning */}
      <motion.div 
        className={`absolute left-0 right-0 z-10 flex justify-center ${
          isBannerVisible ? 'bottom-4 sm:bottom-6 md:bottom-8' : 'bottom-2 sm:bottom-8 md:bottom-12'
        }`}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div aria-hidden="true" className="flex flex-col items-center gap-1 sm:gap-2 md:gap-3 text-white/80 hover:text-white transition-colors cursor-pointer motion-reduce:hidden">
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