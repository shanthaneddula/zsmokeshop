"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone, Sparkles } from "lucide-react";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const messages = [
    {
      icon: MessageCircle,
      text: "Need product recommendations? Chat with our live PuffBuddy expert now!",
      mobileText: "Chat with PuffBuddy for recommendations!",
      cta: "CHAT",
      highlight: "LIVE EXPERT"
    },
    {
      icon: Phone,
      text: "Can't find what you're looking for? Call us at (661) 371-1413",
      mobileText: "Can't find it? Call (661) 371-1413",
      cta: "CALL",
      highlight: "INSTANT HELP"
    },
    {
      icon: Sparkles,
      text: "Our product catalog is growing! Chat for latest arrivals & recommendations",
      mobileText: "Growing catalog! Chat for new arrivals",
      cta: "ASK",
      highlight: "NEW PRODUCTS"
    },
    {
      icon: MessageCircle,
      text: "Looking for specific brands? Our PuffBuddy has access to extended inventory!",
      mobileText: "Specific brands? PuffBuddy has more!",
      cta: "CHAT",
      highlight: "EXTENDED INVENTORY"
    }
  ];

  // Auto-rotate messages every 7 seconds (slower)
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [isVisible, messages.length]);

  const handleChatClick = () => {
    // Open PuffBuddy Tawk.to chat
    if (typeof window !== 'undefined') {
      const tawkWindow = window as typeof window & {
        $_Tawk?: {
          maximize: () => void;
        };
      };
      if (tawkWindow.$_Tawk) {
        tawkWindow.$_Tawk.maximize();
      }
    }
  };

  const handleCallClick = () => {
    window.location.href = 'tel:+16613711413';
  };

  const handleActionClick = () => {
    if (currentMessageIndex === 1) {
      handleCallClick();
    } else {
      handleChatClick();
    }
  };

  if (!isVisible) return null;

  const currentMessage = messages[currentMessageIndex];
  const IconComponent = currentMessage.icon;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black text-white border-b border-white/10">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="relative"
      >
        <div className="flex items-center justify-between py-2.5 md:py-3 px-3 md:px-6 max-w-7xl mx-auto">
          {/* Left side - Icon and rotating message */}
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <motion.div
              key={currentMessageIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex-1 min-w-0"
              >
                {/* Mobile text */}
                <p className="text-xs md:hidden font-medium text-gray-200 leading-tight">
                  {currentMessage.mobileText}
                </p>
                {/* Desktop text */}
                <p className="hidden md:block text-sm font-medium text-gray-200 leading-tight">
                  {currentMessage.text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Center - Highlight badge (desktop only) */}
          <div className="hidden lg:flex items-center mx-4">
            <motion.div
              key={currentMessage.highlight}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="border border-white/30 px-3 py-1 text-xs font-black uppercase tracking-wider text-white"
            >
              {currentMessage.highlight}
            </motion.div>
          </div>

          {/* Right side - CTA and close */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <motion.button
              onClick={handleActionClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-3 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-black uppercase tracking-wide hover:bg-gray-200 transition-all duration-200 border-2 border-white hover:border-gray-200"
            >
              {currentMessage.cta}
            </motion.button>

            <button
              onClick={() => setIsVisible(false)}
              className="text-white/60 hover:text-white transition-colors p-1.5 hover:bg-white/10"
              aria-label="Close announcement"
            >
              <X className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Progress indicator - minimal Adidas style */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10">
        <motion.div
          className="h-full bg-white"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 7, ease: "linear" }}
          key={currentMessageIndex}
        />
      </div>
    </div>
  );
}
