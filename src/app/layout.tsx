import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { BannerProvider } from "@/contexts/BannerContext";
import { CartProvider } from "@/contexts/CartContext";
import AgeVerification from "@/components/layout/age-verification";
import TawkToChat from "@/components/chat/TawkToChat";
import ConditionalLayout from "@/components/layout/conditional-layout";
import { getSiteUrl } from "@/lib/site-url";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Proper viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// SEO-friendly metadata
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Z Smoke Shop | Premium Smoke Shop in Austin, TX",
    template: "%s | Z Smoke Shop",
  },
  description: "Z Smoke Shop offers a wide variety of premium smoke products and accessories in Austin, TX. Visit us today.",
  keywords: "smoke shop, Austin TX, hookah, glass, rolling papers, tobacco accessories, 21+",
  openGraph: {
    title: "Z Smoke Shop - Premium Smoke Shop in Austin, TX",
    description: "Your premier destination for quality smoke shop products and accessories in Austin, Texas.",
    type: "website",
    locale: "en_US",
    url: "/",
    images: [
      {
        url: "/images/og-image.jpg", // To be added later
        width: 1200,
        height: 630,
        alt: "Z Smoke Shop",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased dark:bg-gray-900">
        <Script
          id="age-verified-check"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("ageVerified")==="true")document.documentElement.classList.add("age-verified")}catch(e){}`,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <BannerProvider>
              {/* Main app container - z-smoke-shop-app for identification */}
              <div id="z-smoke-shop-app" className="relative flex min-h-screen flex-col">
                {/* Age verification portal */}
                <AgeVerification />
                
                {/* Conditional layout: Header/Footer for public, clean for admin */}
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
                
                {/* Conditional Tawk.to Chat - Only after age verification */}
                <TawkToChat />
              </div>
            </BannerProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}