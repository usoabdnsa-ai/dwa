import type { Metadata } from "next";
import { Albert_Sans, Newsreader } from "next/font/google";
import { pharmacies } from "@/lib/data";
import { Footer, Header } from "@/v6/chrome";
import { Intro, v6IntroBoot } from "@/v6/intro";
import "@/v6/v6.css";

const sans = Albert_Sans({ variable: "--font-v6-sans", subsets: ["latin"] });
const serif = Newsreader({
  variable: "--font-v6-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Know which pharmacy has your medicine · dwa",
    template: "%s · dwa",
  },
};

/* Design v6 "Evergreen": lives entirely under /v6 and src/v6, so the other versions stay as they are. */
export default function V6Layout({ children }: LayoutProps<"/v6">) {
  return (
    <div
      className={`v6 flex min-h-dvh flex-col ${sans.variable} ${serif.variable}`}
    >
      <script dangerouslySetInnerHTML={{ __html: v6IntroBoot }} />
      <Intro pharmacies={pharmacies.length} />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
