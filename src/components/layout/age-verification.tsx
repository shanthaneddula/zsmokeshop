"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AgeVerification() {
  const pathname = usePathname();
  const isAdmin = Boolean(pathname?.startsWith("/admin"));
  // Show immediately on public pages so LCP/CLS are not delayed by a timeout.
  // A beforeInteractive script adds html.age-verified for already-verified sessions
  // so returning visitors do not flash the dialog.
  const [isVisible, setIsVisible] = useState(!isAdmin);
  const dialogRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);

  // Accessibility: move focus into the dialog, keep Tab inside it, and stop background scroll.
  useEffect(() => {
    if (!isVisible) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => yesRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = dialogRef.current.querySelectorAll<HTMLElement>(
        "button, a[href], [tabindex]:not([tabindex=\"-1\"])"
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!dialogRef.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isVisible]);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      setIsVisible(false);
      return;
    }

    const verified = sessionStorage.getItem("ageVerified") === "true";
    if (verified) {
      document.documentElement.classList.add("age-verified");
      setIsVisible(false);
    } else {
      document.documentElement.classList.remove("age-verified");
      setIsVisible(true);
    }
  }, [pathname]);

  const handleVerification = (isOfAge: boolean) => {
    if (isOfAge) {
      sessionStorage.setItem("ageVerified", "true");
      document.documentElement.classList.add("age-verified");
      setIsVisible(false);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("ageVerified"));
    } else {
      // Redirect to a different page or show a message
      window.location.href = "https://www.google.com";
    }
  };

  if (isAdmin) {
    return null;
  }

  return (
    <div id="age-verification-root">
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Backdrop Overlay — no fade-in delay so the first paint is stable for LCP */}
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-[100]"
              aria-hidden="true"
              onClick={() => {}} // Prevent clicks from passing through
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="age-gate-title"
                aria-describedby="age-gate-desc"
                className="w-full max-w-sm sm:max-w-md mx-auto bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-white shadow-2xl"
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 sm:px-6 py-6 sm:py-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-white dark:border-gray-900 mx-auto flex items-center justify-center mb-4 sm:mb-6">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true" />
                  </div>
                  <h2 id="age-gate-title" className="text-xl sm:text-2xl font-bold uppercase tracking-widest mb-3 sm:mb-4">Age Verification</h2>
                  <div className="w-12 h-0.5 bg-white dark:bg-gray-900 mx-auto mb-3 sm:mb-4"></div>
                  <p id="age-gate-desc" className="text-xs sm:text-sm font-light opacity-80">
                    You must be 21 or older to access this website
                  </p>
                </div>

                {/* Content */}
                <div className="px-4 sm:px-6 py-6 sm:py-8">
                  {/* Age Verification Question */}
                  <div className="mb-6 text-center">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                      Are you 21 years of age or older?
                    </h3>
                    <p className="text-xs sm:text-sm font-light text-gray-600 dark:text-gray-400">
                      Please confirm your age to continue
                    </p>
                  </div>

                  {/* Warning Message */}
                  <div className="mb-6 border border-gray-300 dark:border-gray-600 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-700 dark:text-gray-300 text-center font-light">
                      <span className="font-bold uppercase tracking-wide">Warning:</span> Age-restricted tobacco and nicotine products. 21+ only; valid ID required in store.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-3">
                    <button
                      ref={yesRef}
                      type="button"
                      onClick={() => handleVerification(true)}
                      className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 sm:px-6 py-3 sm:py-4 font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors uppercase tracking-wide text-xs sm:text-sm border border-gray-900 dark:border-white"
                    >
                      Yes, I am 21 or older
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerification(false)}
                      className="w-full border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white px-4 sm:px-6 py-3 sm:py-4 font-bold hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors uppercase tracking-wide text-xs sm:text-sm"
                    >
                      No, I am under 21
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 text-center">
                  <p className="text-xs font-light text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {new Date().getFullYear()} Z Smoke Shop • Austin, TX
                  </p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
