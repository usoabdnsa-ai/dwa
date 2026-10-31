import type { Metadata, Viewport } from "next";
import { Cairo, Plus_Jakarta_Sans, Inter } from "next/font/google";
import { introBootScript } from "@/lib/intro-boot";
import { SwRegister } from "@/components/sw-register";
import "./globals.css";

const heading = Plus_Jakarta_Sans({ variable: "--font-heading", subsets: ["latin"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });
// Arabic text (the main site has an Arabic version); only downloaded when Arabic glyphs are on the page.
const arabic = Cairo({ variable: "--font-arabic", subsets: ["arabic", "latin"], preload: false });

export const metadata: Metadata = {
  title: { default: "dwa · find your medicine in stock", template: "%s · dwa" },
  description: "Search a medicine and see which pharmacies near you have it on the shelf, updated by the pharmacists themselves.",
  appleWebApp: { capable: true, title: "dwa", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#061519" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${heading.variable} ${body.variable} ${arabic.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introBootScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
