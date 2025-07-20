import { Metadata } from "next";
import HeroSection from "@/components/sections/hero-section";
import ProductCategories from "@/components/sections/product-categories";
import FeaturedProducts from "@/components/sections/featured-products";
import StoreLocations from "@/components/sections/store-locations";

export const metadata: Metadata = {
  title: "Z Smoke Shop | Premium Smoke Shop in Austin, TX",
  description: "Z Smoke Shop offers a wide variety of premium smoke products and accessories in Austin, TX. Visit our two convenient locations.",
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      
      <FeaturedProducts />
      <ProductCategories />
      <StoreLocations />
      
      {/* Newsletter Section - Adidas Style */}
      <section className="py-20 bg-gray-900 dark:bg-black text-white">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight uppercase">
              STAY UPDATED
            </h2>
            <div className="w-16 h-0.5 bg-white mx-auto mb-8"></div>
            <p className="mb-10 text-lg font-light text-gray-300">
              Get the latest products, exclusive deals, and special events
            </p>
            <form className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent border border-white/30 px-6 py-4 text-white placeholder-gray-400 focus:border-white focus:outline-none font-light uppercase tracking-wide text-sm"
                required
              />
              <button
                type="submit"
                className="bg-white text-gray-900 px-8 py-4 font-bold hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}