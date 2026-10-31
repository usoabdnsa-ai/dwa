import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import { Colophon, Masthead } from "@/v4/chrome";
import { CursorLight } from "@/v4/cursor-light";
import { Intro, v4IntroBoot } from "@/v4/intro";
import "@/v4/v4.css";

const display = Syne({ variable: "--font-v4-display", subsets: ["latin"] });
const sans = Manrope({ variable: "--font-v4-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "dwa · open all night", template: "%s · dwa" },
};

/* Design v4 "Neon Pharmacy Night": lives entirely under /v4 and src/v4, so v1 to v3 stay as they are. */
export default function V4Layout({ children }: LayoutProps<"/v4">) {
  return (
    <div className={`v4 flex min-h-dvh flex-col ${display.variable} ${sans.variable}`}>
      <script dangerouslySetInnerHTML={{ __html: v4IntroBoot }} />
      <Intro />
      <CursorLight />
      <Masthead />
      <main className="flex-1">{children}</main>
      <Colophon />
    </div>
  );
}
