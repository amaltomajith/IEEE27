import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { CommitteeNav } from "@/components/pages/CommitteeNav";
import { PortraitCard } from "@/components/pages/PortraitCard";
import { MemberDirectory } from "@/components/pages/MemberDirectory";
import { coreOrganizing, trackCommittee } from "@/content/committee";

export const metadata: Metadata = { title: "Organizing Committee", description: "Core organizing and track committee members of IIC 2027." };

export default function OrganizingPage() {
  return (
    <>
      <PageHero title="Organizing committee" emphasis="committee" crumbs={[{ label: "Committee", href: "/committee/" }, { label: "Organizing" }]}>
        <CommitteeNav />
      </PageHero>
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <Reveal>
          <h2 className="t-h2 fade-up mb-10">Core organizing committee</h2>
        </Reveal>
        <ul className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-3 lg:max-w-[75%]">
          {coreOrganizing.map((m, i) => (
            <li key={m.name}><PortraitCard m={m} priority={i < 3} /></li>
          ))}
        </ul>
      </section>
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <MemberDirectory groups={[{ title: "Track Committee", members: trackCommittee }]} />
      </section>
    </>
  );
}
