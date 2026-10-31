import { pharmacies } from "@/lib/data";
import { availabilityFor } from "@/lib/finder";
import { Close } from "@/v3/home/close";
import { Hero } from "@/v3/home/hero";
import { Rota } from "@/v3/home/rota";
import { Steps } from "@/v3/home/steps";
import { Story } from "@/v3/home/story";

// The hard-to-find example: Ventoline, on one shelf in the whole city.
const ventoline = availabilityFor("ventoline-100").map(({ pharmacy, item, status, km }) => ({ pharmacy, item, status, km }));
const onDuty = pharmacies.filter((p) => p.onDuty);
const plan = pharmacies.map((p) => ({ ...p, status: "none" as const }));

export default function V3Home() {
  return (
    <>
      <Hero count={pharmacies.length} />
      <Story rows={ventoline} />
      <Steps />
      <Rota onDuty={onDuty} plan={plan} />
      <Close />
    </>
  );
}
