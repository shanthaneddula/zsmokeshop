import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AgeVerification from "@/components/layout/age-verification";
import TawkToChat from "@/components/chat/TawkToChat";
import AnnouncementBar from "@/components/layout/announcement-bar";

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
  title: {
    default: "Z Smoke Shop | Premium Smoke Shop in Austin, TX",
    template: "%s | Z Smoke Shop",
  },
  description: "Z Smoke Shop offers a wide variety of premium smoke products and accessories in Austin, TX. Visit our two convenient locations.",
  keywords: "smoke shop, Austin TX, vapes, hookah, glass, cigars, tobacco, accessories",
  openGraph: {
    title: "Z Smoke Shop - Premium Smoke Shop in Austin, TX",
    description: "Your premier destination for quality smoke shop products and accessories in Austin, Texas.",
    type: "website",
    locale: "en_US",
    url: "https://zsmokeshop.com", // Replace with actual domain
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Main app container - z-smoke-shop-app for identification */}
          <div id="z-smoke-shop-app" className="relative flex min-h-screen flex-col">
            {/* Age verification portal */}
            <AgeVerification />
            
            {/* Announcement Bar - Fixed at top */}
            <AnnouncementBar />
            
            {/* Header - Positioned to account for announcement bar */}
            <Header />
            
            {/* Main content */}
            {children}
            
            {/* Footer */}
            <Footer />
            
            {/* Conditional Tawk.to Chat - Only after age verification */}
            <TawkToChat />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}