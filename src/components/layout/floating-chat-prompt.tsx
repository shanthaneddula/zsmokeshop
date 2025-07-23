"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Zap, Users, Clock } from "lucide-react";

export default function FloatingChatPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Show the prompt after 5 seconds, but only if user hasn't interacted
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setIsVisible(true);
      }
    }, 5000);

    // Hide after 15 seconds if no interaction
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 20000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [hasInteracted]);

  // Track user interaction
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
    };

    window.addEventListener('scroll', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const handleChatClick = () => {
    setIsVisible(false);
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

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 100 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: 100 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="fixed bottom-6 right-6 z-40 max-w-sm"
      >
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl shadow-2xl border border-purple-400/20 overflow-hidden">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-purple-400/20">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-full p-1.5">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">PuffBuddy Assistant</span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">
              Looking for something specific? 🔍
            </h3>
            <p className="text-white/90 text-sm mb-4 leading-relaxed">
              Our website doesn&apos;t show our full inventory! Chat with our live expert to get personalized recommendations and check availability.
            </p>

            {/* Features */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-white/80">
                <Zap className="h-3 w-3" />
                <span>Instant product recommendations</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <Users className="h-3 w-3" />
                <span>Real person, not a bot</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <Clock className="h-3 w-3" />
                <span>Available during store hours</span>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={handleChatClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white text-purple-600 font-bold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              Chat with PuffBuddy Now
            </motion.button>
          </div>

          {/* Pulse animation */}
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
