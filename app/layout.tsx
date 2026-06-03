import type { Metadata } from "next";
import "@/app/globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { QuoteProvider } from "@/components/features/quote/QuoteProvider";
import { siteContent } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: `${siteContent.name} | ${siteContent.tagline}`,
  description: siteContent.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className="font-body antialiased">
        <QuoteProvider>
          <Header />
          {children}
          <Footer />
        </QuoteProvider>
      </body>
    </html>
  );
}
