import { Intro } from "@/components/intro";
import { Reveal } from "@/components/reveal";
import { Hero } from "@/components/home/hero";
import { DoorToDoor } from "@/components/home/door-to-door";
import { AnnotatedResult } from "@/components/home/annotated-result";
import { OnDuty } from "@/components/home/on-duty";
import { ForPharmacists } from "@/components/home/for-pharmacists";

export default function Home() {
  return (
    <>
      <Intro />
      <Reveal />
      <Hero />
      <DoorToDoor />
      <AnnotatedResult />
      <OnDuty />
      <ForPharmacists />
    </>
  );
}
