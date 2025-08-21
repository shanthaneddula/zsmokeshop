import { Metadata } from "next";
import HeroSection from "@/components/sections/hero-section";
import HomepageCatalogue from "@/components/sections/homepage-catalogue";
import FeaturedProducts from "@/components/sections/featured-products";
import StoreLocations from "@/components/sections/store-locations";
import HelpAndReviews from "@/components/sections/help-and-reviews";

export const metadata: Metadata = {
  title: "Z Smoke Shop | Premium Smoke Shop in Austin, TX",
  description: "Z Smoke Shop offers a wide variety of premium smoke products and accessories in Austin, TX. Visit our two convenient locations.",
};

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Products Section */}
      <FeaturedProducts />
      
      {/* Homepage Catalogue Section */}
      <HomepageCatalogue />
      
      {/* Store Locations Section */}
      <StoreLocations />
      
      {/* Help and Reviews Section */}
      <HelpAndReviews />
    </main>
  );
}