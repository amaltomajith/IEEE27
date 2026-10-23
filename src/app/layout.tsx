import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { NavProgress } from "@/components/ui/NavProgress";
import { site } from "@/content/site";

// Cormorant Garamond (CHRIST-style serif) for headings and titles, Poppins for text.
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-poppins", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.short} | ${site.theme}`, template: `%s | ${site.short}` },
  description: `${site.name}. ${site.theme}. ${site.dates}, ${site.mode}, ${site.host}, ${site.campus}.`,
  openGraph: {
    title: `${site.short}: Mind and Machine`,
    description: site.theme,
    images: ["/images/brand/iic-banner.webp"],
    type: "website",
  },
  icons: { icon: "/icon.svg" },
};

// White-first site: opt out of browser/OS auto-dark (Chrome Android, Samsung Internet).
export const viewport: Viewport = { themeColor: "#f3f5f9", colorScheme: "only light" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${poppins.variable}`}>
      <body>
        <a
          href="#main"
          className="fixed top-[-60px] left-4 z-[100] rounded-full bg-navy px-4 py-2.5 text-white transition-[top] focus:top-4"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <NavProgress />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
