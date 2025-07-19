"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

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
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our wide selection of premium products across multiple categories
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

function CategoryCard({ category }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link href={`/category/${category.slug}`}>
      <motion.div 
        className="relative rounded-xl overflow-hidden card hover-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Image container - explicitly set position relative and minimum height */}
        <div className="relative w-full h-52 overflow-hidden">
          {/* Placeholder gradient background until images are added */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-800 to-accent-900">
            {/* When images are available, uncomment this:
            <Image 
              src={category.image} 
              alt={category.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-transform duration-500 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
            />
            */}
          </div>
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-200">{category.count} products</p>
            
            <motion.span 
              className="text-brand-400 text-sm font-medium"
              initial={{ x: 0 }}
              animate={{ x: isHovered ? 5 : 0 }}
            >
              View All →
            </motion.span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}