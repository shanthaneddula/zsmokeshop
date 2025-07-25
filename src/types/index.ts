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
