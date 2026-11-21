import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
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

export const metadata = {
  metadataBase: new URL("https://davoriq.com"),
  title: {
    default: "Davoriq | Best Digital QR Menu Maker & Restaurant Software",
    template: "%s | Davoriq Digital Menus"
  },
  description: "Davoriq is the ultimate digital QR menu maker and restaurant ordering system. Create stunning, contactless smart menus in seconds, increase sales, and elevate your dine-in experience.",
  keywords: [
    "QR code menu generator", 
    "digital menu software", 
    "contactless restaurant menu", 
    "Davoriq", 
    "smart restaurant menu", 
    "dine-in ordering system",
    "restaurant menu builder",
    "QR menu app",
    "digital dining experience",
    "scan to order menu"
  ],
  authors: [{ name: "Davoriq" }],
  creator: "Davoriq",
  publisher: "Davoriq",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Davoriq | Best Digital QR Menu Maker",
    description: "Create beautiful digital menus for your restaurant in seconds. Increase sales with our intelligent, contactless ordering system.",
    url: "https://davoriq.com",
    siteName: "Davoriq",
    images: [
      {
        url: "/og-image.png", // Ensure you add an og-image.png to the public folder
        width: 1200,
        height: 630,
        alt: "Davoriq Digital Menu Software Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Davoriq | Digital QR Menu SaaS",
    description: "Create beautiful, high-converting digital menus for your restaurant in seconds.",
    images: ["/og-image.png"],
    creator: "@davoriq", // Optional: Change to your actual Twitter handle
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
  verification: {
    google: "google-site-verification=F7dWTD5auE9UbBI1vaiJfzIpZ9Fw0PhUL30enmTYfqM", // TODO: Replace this with actual Google Console ID
  },
};

export default function RootLayout({ children }) {
  // Schema.org Structured Data for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Davoriq",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "url": "https://davoriq.com",
    "description": "Enterprise-grade digital QR menu maker and smart contactless ordering system for restaurants and hospitality businesses.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "creator": {
      "@type": "Organization",
      "name": "Davoriq",
      "url": "https://davoriq.com"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-background text-foreground font-sans`}>
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
