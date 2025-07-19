'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, X } from 'lucide-react';

export default function AgeVerification() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already been verified in this session
    const verified = sessionStorage.getItem('ageVerified');
    if (!verified) {
      // Small delay to ensure page loads first
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  const handleVerification = (isOfAge: boolean) => {
    if (isOfAge) {
      sessionStorage.setItem('ageVerified', 'true');
      setIsVisible(false);
    } else {
      // Redirect to a different page or show a message
      window.location.href = 'https://www.google.com';
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-[100] bg-black bg-opacity-70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 text-center relative overflow-hidden border border-purple-200 dark:border-gray-700"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 opacity-50" />
          
          <div className="relative z-10">
            <div className="mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Age Verification
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed max-w-sm mx-auto">
                You must be <strong>21 or older</strong> to access this website. This site contains age-restricted tobacco and vaping products.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVerification(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg"
              >
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg">Yes, I am 21 or older</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVerification(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <X className="w-6 h-6" />
                <span className="text-lg">No, I am under 21</span>
              </motion.button>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Z SMOKE SHOP</span>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
                <p>719 W William Cannon Dr #105, Austin, TX 78745</p>
                <p>5318 Cameron Rd, Austin, TX 78723</p>
                <p className="mt-2">© 2025 Z Smoke Shop. All rights reserved.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}