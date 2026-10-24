import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Ribbon } from "@/components/ui/Ribbon";
import { CommitteeNav } from "@/components/pages/CommitteeNav";
import { PortraitCard } from "@/components/pages/PortraitCard";
import { TrackCommittee } from "@/components/pages/TrackCommittee";
import { coreOrganizing } from "@/content/committee";

export const metadata: Metadata = { title: "Organizing Committee", description: "Core Organizing Committee and Track Committee members of IIC 2027." };

export default function OrganizingPage() {
  return (
    <>
      <PageHero title="Organizing Committee" emphasis="Committee" crumbs={[{ label: "Committee", href: "/committee/" }, { label: "Organizing" }]}>
        <CommitteeNav />
      </PageHero>
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <Reveal>
          <h2 className="t-h2 fade-up mb-10">Core Organizing Committee</h2>
        </Reveal>
        <ul className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-3 lg:max-w-[75%]">
          {coreOrganizing.map((m, i) => (
            <li key={m.name}><PortraitCard m={m} priority={i < 3} /></li>
          ))}
        </ul>
      </section>
      <section className="tint-a relative overflow-hidden py-[clamp(80px,10vw,170px)] text-ink">
        <Ribbon shape="s" className="top-[-4%] right-[-5%] h-[clamp(240px,24vw,420px)] max-md:top-[-2%] max-md:right-[-16%] max-md:h-[220px]" />
        <div className="wrap relative z-[1]">
          <Reveal>
            <h2 className="t-h2 fade-up mb-4 max-w-[16ch]">
              Track <span className="em text-brand-ink">Committee</span>
            </h2>
            <p className="fade-up mb-[clamp(40px,5vw,80px)] max-w-[52ch] text-ink/75">
              Each of the four thematic tracks is curated by faculty from its home school at CHRIST University.
            </p>
          </Reveal>
          <TrackCommittee />
        </div>
      </section>
    </>
  );
}
