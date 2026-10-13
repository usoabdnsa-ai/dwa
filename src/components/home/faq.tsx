import { ChevronDown } from "lucide-react";

const FAQ = [
  { q: "How fresh is the stock information?", a: "Each line shows when the pharmacist last updated it. Most pharmacies update several times a day as boxes leave the shelf." },
  { q: "Can I reserve a medicine?", a: "Not yet. Every result has a call button so you can ask the pharmacy to set a box aside before you go." },
  { q: "What is a pharmacie de garde?", a: "The pharmacies on the night and weekend duty rota. They are flagged in the results and can be filtered on their own." },
  { q: "Do I still need my prescription?", a: "Yes. Medicines marked “Prescription” are only handed over with a valid prescription, as usual." },
  { q: "I'm a pharmacist. How do I join?", a: "Open the pharmacist space and sign in. Accounts are checked against the pharmacy's licence before going live." },
];

export function Faq() {
  return (
    <section className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[1fr_1.5fr]">
        <div data-reveal>
          <p className="text-sm font-semibold tracking-wide text-green uppercase">Questions</p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">Good to know</h2>
          <p className="mt-4 max-w-[36ch] text-muted">Everything about how dwa finds your medicine, in short answers.</p>
        </div>
        <div data-reveal className="divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold transition-colors hover:text-green">
                {f.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-paper ring-1 ring-line group-open:bg-green group-open:text-white group-open:ring-green">
                  <ChevronDown className="faq-chevron size-4 transition-transform duration-200" aria-hidden />
                </span>
              </summary>
              <p className="max-w-[60ch] pb-5 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
