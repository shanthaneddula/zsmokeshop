"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
// Image import removed as it's not currently used (uncomment when adding actual images)
// import Image from "next/image";

// Sample categories data - replace with actual content later
const categories = [
  {
    id: 1,
    name: "Vapes & Mods",
    image: "/images/category-vapes.jpg", // To be added later
    slug: "vapes-mods-pods",
    count: 24,
  },
  {
    id: 2,
    name: "Glass",
    image: "/images/category-glass.jpg", // To be added later
    slug: "glass",
    count: 18,
  },
  {
    id: 3,
    name: "Accessories",
    image: "/images/category-accessories.jpg", // To be added later
    slug: "accessories",
    count: 32,
  },
  {
    id: 4,
    name: "Papers & Wraps",
    image: "/images/category-papers.jpg", // To be added later
    slug: "papers-wraps",
    count: 15,
  },
  {
    id: 5,
    name: "Cigars",
    image: "/images/category-cigars.jpg", // To be added later
    slug: "cigars",
    count: 10,
  },
  {
    id: 6,
    name: "CBD Products",
    image: "/images/category-cbd.jpg", // To be added later
    slug: "cbd-products",
    count: 20,
  },
];

export default function ProductCategories() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container-wide">
        {/* Section header - Adidas Style */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-6 uppercase">
            Shop Categories
          </h2>
          <div className="w-16 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-8"></div>
          <p className="text-lg font-light text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Discover premium products across our curated categories
          </p>
        </div>
        
        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Define the category type
type Category = {
  id: number;
  name: string;
  image: string;
  slug: string;
  count: number;
};

function CategoryCard({ category }: { category: Category }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link href={`/category/${category.slug}`}>
      <motion.div 
        className="group relative bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Image container */}
        <div className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
          {/* Placeholder - clean geometric pattern */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-600 group-hover:border-gray-900 dark:group-hover:border-white transition-colors duration-300"></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
            {category.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <p className="text-sm font-light text-gray-600 dark:text-gray-400">
              {category.count} Products
            </p>
            
            <motion.div 
              className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide"
              initial={{ x: 0 }}
              animate={{ x: isHovered ? 4 : 0 }}
            >
              Shop
              <div className="w-4 h-px bg-gray-900 dark:bg-white"></div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}