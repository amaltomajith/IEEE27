import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { NavProgress } from "@/components/ui/NavProgress";
import { site } from "@/content/site";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["wdth"],
  variable: "--font-instrument",
  display: "swap",
});
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

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

export const viewport: Viewport = { themeColor: "#22d8c8" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrument.variable} ${mono.variable}`}>
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
