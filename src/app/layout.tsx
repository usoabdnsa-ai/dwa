import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { introBootScript } from "@/lib/intro-boot";
import "./globals.css";

const heading = Plus_Jakarta_Sans({ variable: "--font-heading", subsets: ["latin"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "dwa · find your medicine in stock", template: "%s · dwa" },
  description: "Search a medicine and see which pharmacies near you have it on the shelf, updated by the pharmacists themselves.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introBootScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
