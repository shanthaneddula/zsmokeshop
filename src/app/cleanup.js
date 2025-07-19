'use client';

import { useEffect } from 'react';

// A more careful cleanup component that only removes sidebar elements
export function UICleanup() {
  useEffect(() => {
    // Only remove specific problematic elements - not the entire page
    const targetCleanup = () => {
      // Specific selectors for sidebar and overlay elements that cause problems
      const sidebarSelectors = [
        '.sidebar-overlay',
        '.sidebar-wrapper',
        '.fixed-sidebar',
        '.mobile-nav-overlay',
        '.off-canvas-menu',
        '.drawer-overlay',
        '[class*="sidebar"]', // Classes containing "sidebar"
        '[id*="sidebar"]',    // IDs containing "sidebar"
        // Add more specific selectors as needed
      ];
      
      // Try to identify and remove only problematic elements
      sidebarSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            // Skip removing our own app elements
            if (el.closest('#z-smoke-shop-app')) return;
            
            // Only remove if outside our main app
            el.remove();
          });
        } catch {
          // Ignore removal errors
        }
      });

      // Ensure body has proper styles without removing content
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'auto';
      document.body.style.width = '100%';
      
      // Add a debug indicator to help troubleshoot
      const debugElement = document.createElement('div');
      debugElement.style.position = 'fixed';
      debugElement.style.bottom = '0';
      debugElement.style.right = '0';
      debugElement.style.backgroundColor = 'rgba(0,0,0,0.2)';
      debugElement.style.color = 'white';
      debugElement.style.padding = '2px 5px';
      debugElement.style.fontSize = '10px';
      debugElement.style.zIndex = '9999';
      debugElement.textContent = 'Cleanup Active';
      debugElement.style.pointerEvents = 'none';
      document.body.appendChild(debugElement);
    };

    // Run cleanup after a short delay to ensure page is loaded
    const timeoutId = setTimeout(targetCleanup, 1000);
    
    // Run again after a longer delay to catch late-loading elements
    const secondTimeoutId = setTimeout(targetCleanup, 3000);
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(secondTimeoutId);
    };
  }, []);
  
  return null;
}

export default UICleanup;