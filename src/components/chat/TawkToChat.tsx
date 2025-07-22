"use client";

import { useEffect, useState } from 'react';

export default function TawkToChat() {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [tawkLoaded, setTawkLoaded] = useState(false);

  useEffect(() => {
    // Check age verification status
    const checkAgeVerification = () => {
      const verified = sessionStorage.getItem("ageVerified");
      if (verified === "true") {
        setIsAgeVerified(true);
      }
    };

    // Initial check
    checkAgeVerification();

    // Listen for storage changes (when age verification happens)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ageVerified" && e.newValue === "true") {
        setIsAgeVerified(true);
      }
    };

    // Also listen for custom events (in case verification happens in same tab)
    const handleAgeVerified = () => {
      checkAgeVerification();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ageVerified', handleAgeVerified);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ageVerified', handleAgeVerified);
    };
  }, []);

  useEffect(() => {
    // Only load Tawk.to script after age verification
    if (isAgeVerified && !tawkLoaded) {
      loadTawkToScript();
      setTawkLoaded(true);
    }
  }, [isAgeVerified, tawkLoaded]);

  const loadTawkToScript = () => {
    // Initialize Tawk.to API
    interface TawkWindow extends Window {
      Tawk_API?: {
        onLoad?: () => void;
      };
      Tawk_LoadStart?: Date;
    }
    
    const tawkWindow = window as TawkWindow;
    tawkWindow.Tawk_API = tawkWindow.Tawk_API || {};
    tawkWindow.Tawk_LoadStart = new Date();

    // Customize widget after load
    if (tawkWindow.Tawk_API) {
      tawkWindow.Tawk_API.onLoad = function() {
        // Remove any green colors and rounded corners
        setTimeout(function() {
          const chatWidget = document.getElementById('tawkchat-minified-container');
          if (chatWidget) {
            // Force black background and square corners
            const elements = chatWidget.querySelectorAll('*');
            elements.forEach(function(el) {
              const htmlEl = el as HTMLElement;
              htmlEl.style.setProperty('background-color', '#000000', 'important');
              htmlEl.style.setProperty('background', '#000000', 'important');
              htmlEl.style.setProperty('border-radius', '0', 'important');
              htmlEl.style.setProperty('border-top-left-radius', '0', 'important');
              htmlEl.style.setProperty('border-top-right-radius', '0', 'important');
              htmlEl.style.setProperty('border-bottom-left-radius', '0', 'important');
              htmlEl.style.setProperty('border-bottom-right-radius', '0', 'important');
              htmlEl.style.setProperty('color', '#FFFFFF', 'important');
            });
          }
        }, 1000);
      };
    }

    // Load the Tawk.to script
    const script = document.createElement('script');
    const firstScript = document.getElementsByTagName('script')[0];
    script.async = true;
    script.src = 'https://embed.tawk.to/687ea7f77f202b19181f0a47/1j0ngsthh';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }
  };

  // Don't render anything - the script handles the widget
  return null;
}
