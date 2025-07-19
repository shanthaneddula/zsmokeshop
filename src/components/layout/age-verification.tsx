"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle, X } from "lucide-react";

export default function AgeVerification() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already been verified in this session
    const verified = sessionStorage.getItem("ageVerified");
    if (!verified) {
      // Small delay to ensure page loads first
      setTimeout(() => setIsVisible(true), 800);
    }
  }, []);

  const handleVerification = (isOfAge: boolean) => {
    if (isOfAge) {
      sessionStorage.setItem("ageVerified", "true");
      setIsVisible(false);
    } else {
      // Redirect to a different page or show a message
      window.location.href = "https://www.google.com";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-overlay"
            onClick={() => {}} // Prevent clicks from passing through
          />

          {/* Modal */}
          <div className="fixed inset-0 z-modal flex items-center justify-center p-6">
            <motion.div
              className="w-full max-w-xs mx-auto overflow-hidden rounded-2xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="bg-white dark:bg-gray-800">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 px-5 py-6 text-center text-white">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Shield className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-bold mb-1">Age Verification</h2>
                    <p className="text-xs text-white/90 leading-relaxed">
                      You must be 21 or older to access this website
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Warning Message */}
                  <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 dark:bg-amber-900/20 dark:border-amber-800">
                    <p className="text-xs text-amber-800 dark:text-amber-200 text-center leading-relaxed">
                      <strong>Warning:</strong> This website contains age-restricted tobacco and vaping products. 
                      By entering, you confirm you are of legal smoking age.
                    </p>
                  </div>

                  {/* Age Verification Question */}
                  <div className="mb-4 text-center">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      Are you 21 years of age or older?
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Please confirm your age to continue
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleVerification(true)}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-[0.98]"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Yes, I am 21 or older</span>
                    </button>
                    <button
                      onClick={() => handleVerification(false)}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 active:scale-[0.98] dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" />
                      <span>No, I am under 21</span>
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-center dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    2025 Z Smoke Shop • Licensed Tobacco Retailer • Austin, TX
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}