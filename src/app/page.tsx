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
      
      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-br from-brand-900 to-accent-900 text-white">
        <div className="container-narrow text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="mb-6 max-w-xl mx-auto">
            Stay updated with our latest products, exclusive deals, and special events.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 rounded-lg bg-white/10 border-white/20 px-4 py-3 text-white placeholder-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-white px-6 py-3 font-medium text-brand-900 hover:bg-white/90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}