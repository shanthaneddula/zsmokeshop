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
  category: string;
  price: number;
  image: string;
  description?: string;
  inStock: boolean;
}

export interface ReviewData {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}
