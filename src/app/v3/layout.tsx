import type { Metadata } from "next";
import { Figtree, Unbounded } from "next/font/google";
import { Colophon, Masthead } from "@/v3/chrome";
import { Intro, v3IntroBoot } from "@/v3/intro";
import "@/v3/v3.css";

const display = Unbounded({ variable: "--font-v3-display", subsets: ["latin"] });
const sans = Figtree({ variable: "--font-v3-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "dwa · find it on the shelf", template: "%s · dwa" },
};

/* Design v3 "Pill Pop": lives entirely under /v3 and src/v3, so v1/v2 stay as they are. */
export default function V3Layout({ children }: LayoutProps<"/v3">) {
  return (
    <div className={`v3 flex min-h-dvh flex-col ${display.variable} ${sans.variable}`}>
      <script dangerouslySetInnerHTML={{ __html: v3IntroBoot }} />
      <Intro />
      <Masthead />
      <main className="flex-1">{children}</main>
      <Colophon />
    </div>
  );
}
