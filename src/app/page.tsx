import { HomeHero } from "@/components/hero/HomeHero";
import { TracksSection } from "@/components/home/TracksSection";
import { OrganizersSection } from "@/components/home/OrganizersSection";
import { DatesSection } from "@/components/home/DatesSection";
import { TakePart } from "@/components/home/TakePart";
import { AdvisoryStack } from "@/components/home/AdvisoryStack";
import { Faq } from "@/components/home/Faq";
import { CtaBlock } from "@/components/home/CtaBlock";

export default function Home() {
  return (
    <>
      <HomeHero />
      <TracksSection />
      <OrganizersSection />
      <DatesSection />
      <TakePart />
      <AdvisoryStack />
      <Faq />
      <CtaBlock />
    </>
  );
}
