import { SearchBox } from "../search-box";
import { NeonCross } from "../ui";

/* Closing band: one more neon sign and the search. */
export function Close() {
  return (
    <section className="relative overflow-hidden border-t border-(--nn-line)">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,color-mix(in_oklab,var(--nn-magenta)_18%,transparent),transparent_60%)]" />
      <div className="relative mx-auto max-w-3xl px-4 py-28 text-center sm:px-6 sm:py-36">
        <NeonCross tone="magenta" className="mx-auto w-16" />
        <h2 className="v4-display mt-8 text-[clamp(2.2rem,6vw,4.4rem)]">Don’t drive around the city to find out.</h2>
        <div className="mt-10 text-left">
          <SearchBox />
        </div>
      </div>
    </section>
  );
}
