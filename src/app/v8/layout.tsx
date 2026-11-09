import type { Metadata } from "next";
import { Funnel_Display, Funnel_Sans, Geist_Mono } from "next/font/google";
import { Blob } from "@/v8/blob";
import { Dock, Footer, TopBar } from "@/v8/chrome";
import { Intro, v8IntroBoot } from "@/v8/intro";
import "@/v8/v8.css";

const display = Funnel_Display({ variable: "--font-v8-display", subsets: ["latin"] });
const sans = Funnel_Sans({ variable: "--font-v8-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-v8-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "dwa · who has your medicine", template: "%s · dwa" },
};

/* Design v8 "Liquid light": the whole dwa app under /v8 and src/v8, next to v7 and the others. */
export default function V8Layout({ children }: LayoutProps<"/v8">) {
  return (
    <div className={`v8 relative isolate flex min-h-dvh flex-col ${display.variable} ${sans.variable} ${mono.variable}`}>
      <script dangerouslySetInnerHTML={{ __html: v8IntroBoot }} />
      <Blob />
      <Intro />
      <TopBar />
      <main id="main" className="flex-1 overflow-x-clip">
        {children}
      </main>
      <Footer />
      <Dock />
    </div>
  );
}
