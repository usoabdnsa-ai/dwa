import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Colophon, Masthead } from "@/v5/chrome";
import { Intro, v5IntroBoot } from "@/v5/intro";
import "@/v5/v5.css";

const sans = Geist({ variable: "--font-v5-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-v5-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "dwa · medicine in stock, near you", template: "%s · dwa" },
};

/* Design v5 "Sleek dark product": lives entirely under /v5 and src/v5, so v1 to v4 stay as they are. */
export default function V5Layout({ children }: LayoutProps<"/v5">) {
  return (
    <div className={`v5 flex min-h-dvh flex-col ${sans.variable} ${mono.variable}`}>
      <script dangerouslySetInnerHTML={{ __html: v5IntroBoot }} />
      <Intro />
      <Masthead />
      <main className="flex-1">{children}</main>
      <Colophon />
    </div>
  );
}
