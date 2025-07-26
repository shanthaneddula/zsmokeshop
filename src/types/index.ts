// Types for Z SMOKE SHOP website

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface PromoItem {
  id: string;
  title: string;
  description: string;
  image: string;
  discount?: string;
  cta?: string;
}

export interface Location {
  id: string;
  name?: string;
  address: string;
  phone?: string;
  hours?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  salePrice?: number;
  image: string;
  description?: string;
  brand?: string;
  inStock: boolean;
  badges?: string[]; // e.g., ['new', 'best-seller', 'sale', 'out-of-stock']
  rating?: number;
}

export interface ReviewData {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

// Admin Product interface for backend management
export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  salePrice?: number;
  image?: string;
  description?: string;
  brand?: string;
  inStock: boolean;
  badges?: string[];
  sku?: string;
  status: 'active' | 'inactive' | 'draft';
  weight?: string;
  dimensions?: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  imageHistory?: string[];
  
  // Compliance and Safety Fields
  complianceLevel?: 'none' | 'age-restricted' | 'regulated' | 'prescription';
  complianceTemplate?: string; // Template ID
  complianceNotes?: string[]; // Custom compliance notes
  safetyWarnings?: string[]; // Safety warnings
  legalDisclaimers?: string[]; // Legal disclaimers
  intendedUse?: string; // Intended use description
  ageRestriction?: number; // Minimum age (18, 21, etc.)
  
  // Cannabis-Specific Fields
  subcategory?: string; // Gummies, Cartridges, etc.
  strainType?: 'indica' | 'sativa' | 'hybrid';
  strainName?: string; // e.g., Runtz, Gelato
  cannabinoidType?: string[]; // THC-A, CBD, Delta-8 (multi-select)
  cannabinoidStrength?: number; // mg for edibles, drinks, vapes
  thcaPercentage?: number; // % for flower & pre-rolls
  weightVolume?: string; // e.g., 1g, 1/8oz, 1ml
  unitsPerPack?: number; // e.g., 25ct, 2-pack
  servingsPerItem?: number; // e.g., 1 or 2 (for drinks)
  bottleSize?: string; // oz for drinks
  volume?: string; // ml for cartridges/disposables
  potency?: number; // mg for cartridges/disposables
  is510Compatible?: boolean; // for cartridges
  batteryIncluded?: boolean; // for disposables
  totalGrams?: number; // for pre-rolls
  count?: number; // count for pre-rolls
  effectTags?: string[]; // Relaxing, Uplifting, Focus, Sleep
}

// Admin Category interface for backend management
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: 'active' | 'inactive' | 'draft';
  sortOrder?: number;
  productCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Compliance Template interface for predefined compliance rules
export interface ComplianceTemplate {
  id: string;
  name: string;
  category: string;
  level: 'none' | 'age-restricted' | 'regulated' | 'prescription';
  defaultNotes: string[];
  defaultWarnings: string[];
  defaultDisclaimers: string[];
  ageRestriction: number;
  description?: string;
}

// Compliance validation result
export interface ComplianceValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
