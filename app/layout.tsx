import type { Metadata } from "next";
import "@/app/globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { QuoteProvider } from "@/components/features/quote/QuoteProvider";
import { siteContent } from "@/lib/constants/site";
import { siteConfig } from "@/lib/config";

const seoKeywords = [
  "velas artesanales",
  "suculentas",
  "plantas para regalo",
  "flores de vela",
  "recuerdos personalizados",
  "detalles para eventos",
  "regalos artesanales",
  "Atelier Floral",
];

function getMetadataBase() {
  try {
    return new URL(siteConfig.siteUrl);
  } catch {
    return new URL("https://atelierfloral.mx");
  }
}

function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: `${siteContent.name} | ${siteContent.tagline}`,
    template: `%s | ${siteContent.name}`,
  },
  description: siteContent.description,
  keywords: seoKeywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteContent.name} | ${siteContent.tagline}`,
    description: siteContent.description,
    url: siteConfig.siteUrl,
    siteName: siteContent.name,
    locale: "es_MX",
    type: "website",
    images: [{ url: "/images/hero.png", width: 1200, height: 630, alt: siteContent.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteContent.name} | ${siteContent.tagline}`,
    description: siteContent.description,
    images: ["/images/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteContent.name,
    url: siteConfig.siteUrl,
    description: siteContent.description,
    email: siteContent.privacyEmail,
    image: `${siteConfig.siteUrl}/images/hero.png`,
    sameAs: [getWhatsAppBusinessUrl()],
    makesOffer: ["Velas artesanales", "Suculentas", "Recuerdos personalizados", "Kits de regalo", "Productos personalizados"],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteContent.name,
    url: siteConfig.siteUrl,
    description: siteContent.description,
    inLanguage: "es-MX",
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-body antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema) }} />
        <QuoteProvider>
          <Header />
          {children}
          <Footer />
        </QuoteProvider>
      </body>
    </html>
  );
}

function getWhatsAppBusinessUrl() {
  const phone = siteConfig.whatsappPhone.replace(/\D/g, "");
  return phone ? `https://wa.me/${phone}` : siteConfig.siteUrl;
}
