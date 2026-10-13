import { Quote, Star } from "lucide-react";

/* Illustrative quotes for the prototype, written from the kind of feedback the project is built around. */
const QUOTES = [
  { text: "My son needed Ventoline at 1 a.m. I found the pharmacie de garde that had it in under a minute.", name: "Amina", role: "Mother of two, Kouba" },
  { text: "Before, patients called us ten times a day asking if we had something. Now they already know.", name: "Karim", role: "Pharmacist, El Biar" },
  { text: "I take Levothyrox every day. When my usual pharmacy ran out, dwa showed me the next one in Hydra.", name: "Nadia", role: "Teacher, Hydra" },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <div data-reveal className="max-w-2xl">
        <p className="text-sm font-semibold tracking-wide text-green uppercase">Why it matters</p>
        <h2 className="mt-3 font-display text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
          Less searching, more getting better.
        </h2>
      </div>

      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {QUOTES.map((q) => (
          <li key={q.name} data-reveal className="surface flex flex-col rounded-card p-6">
            <div className="flex items-center justify-between">
              <span className="flex gap-0.5 text-amber" aria-label="5 out of 5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-4 fill-current" aria-hidden />
                ))}
              </span>
              <Quote className="size-6 text-green-soft" aria-hidden />
            </div>
            <blockquote className="mt-5 flex-1 leading-relaxed">“{q.text}”</blockquote>
            <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
              <span className="grid size-10 place-items-center rounded-full bg-green-soft font-display font-bold text-green">{q.name[0]}</span>
              <div>
                <p className="font-semibold">{q.name}</p>
                <p className="text-sm text-muted">{q.role}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">Illustrative quotes for the prototype.</p>
    </section>
  );
}
