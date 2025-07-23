"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BannerContextType {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  bannerHeight: number;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export function BannerProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisibleState] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const bannerHeight = 52; // 3.25rem in pixels (52px)

  // Load banner state from localStorage on mount and mark as hydrated
  useEffect(() => {
    const saved = localStorage.getItem('z-smoke-shop-banner-dismissed');
    if (saved === 'true') {
      setIsVisibleState(false);
    }
    setIsHydrated(true);
  }, []);

  // Save banner state to localStorage when changed
  const setIsVisible = (visible: boolean) => {
    setIsVisibleState(visible);
    localStorage.setItem('z-smoke-shop-banner-dismissed', visible ? 'false' : 'true');
  };

  return (
    <BannerContext.Provider value={{ 
      isVisible: isHydrated ? isVisible : true, // Always true during SSR
      setIsVisible, 
      bannerHeight 
    }}>
      {children}
    </BannerContext.Provider>
  );
}

export function useBanner() {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error('useBanner must be used within a BannerProvider');
  }
  return context;
}
