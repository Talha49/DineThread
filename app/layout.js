import { Inter, Outfit, Playfair_Display, Bebas_Neue, Montserrat } from "next/font/google";
import "./globals.css";
import { siteOrigin } from "@/lib/site-origin";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { LanguageSync } from "@/components/providers/LanguageSync";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { ImageUploadProvider } from "@/context/ImageUploadContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap', preload: false });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas', display: 'swap', preload: false });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap', preload: false });

export const metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "DineThread | Best Digital QR Menu Maker & Restaurant Software",
    template: "%s | DineThread Digital Menus"
  },
  description: "DineThread is the ultimate digital QR menu maker and restaurant ordering system. Create stunning, contactless smart menus in seconds, increase sales, and elevate your dine-in experience.",
  keywords: [
    "QR code menu generator", 
    "digital menu software", 
    "contactless restaurant menu", 
    "DineThread",
    "smart restaurant menu", 
    "dine-in ordering system",
    "restaurant menu builder",
    "QR menu app",
    "digital dining experience",
    "scan to order menu"
  ],
  authors: [{ name: "DineThread" }],
  creator: "DineThread",
  publisher: "DineThread",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DineThread | Best Digital QR Menu Maker",
    description: "Create beautiful digital menus for your restaurant in seconds. Increase sales with our intelligent, contactless ordering system.",
    url: siteOrigin,
    siteName: "DineThread",
    images: [
      {
        url: "/dashboard-showcase.png",
        width: 1024,
        height: 1024,
        alt: "DineThread Digital Menu Software Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DineThread | Digital QR Menu SaaS",
    description: "Create beautiful, high-converting digital menus for your restaurant in seconds.",
    images: ["/dashboard-showcase.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  // Schema.org Structured Data for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineThread",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "url": siteOrigin,
    "description": "Enterprise-grade digital QR menu maker and smart contactless ordering system for restaurants and hospitality businesses.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "creator": {
      "@type": "Organization",
      "name": "DineThread",
      "url": siteOrigin
    }
  };

  return (
    <html lang="en" dir="ltr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${playfair.variable} ${bebas.variable} ${montserrat.variable} antialiased bg-background text-foreground font-sans`}>
        <LanguageSync />
        <AuthProvider>
          <ImageUploadProvider>
            <GlobalLoader />
            {children}
            <ToastProvider />
          </ImageUploadProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
