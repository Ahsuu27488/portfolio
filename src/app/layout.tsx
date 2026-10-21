import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { hero, person } from "@/content/site";
import "./globals.css";

const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ahsandev.site"),
  title: `${person.name} — websites, AI chatbots and automation`,
  description: hero.sentence,
  openGraph: {
    title: `${person.name} — software that ships`,
    description: hero.sentence,
    url: "https://ahsandev.site",
    type: "website",
    images: [{ url: "/work/taskvane-overview.webp", width: 1600, height: 936, alt: "Taskvane, built by Muhammad Ahsan" }],
  },
};

export const viewport: Viewport = { themeColor: "#151917" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${hanken.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
