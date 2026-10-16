import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { CommitteeNav } from "@/components/pages/CommitteeNav";
import { PortraitCard } from "@/components/pages/PortraitCard";
import { generalChairs, mentors } from "@/content/committee";

export const metadata: Metadata = { title: "Committee", description: "Mentors and General Chairs of IIC 2027." };

export default function CommitteePage() {
  return (
    <>
      <PageHero title="The people behind IIC 2027" emphasis="people" crumbs={[{ label: "Committee" }]}>
        <CommitteeNav />
      </PageHero>
      {[
        { title: "Mentors", list: mentors },
        { title: "General Chairs", list: generalChairs },
      ].map((g, gi) => (
        <section key={g.title} className="wrap pb-[clamp(64px,8vw,130px)]">
          <Reveal>
            <h2 className="t-h2 fade-up mb-10">{g.title}</h2>
          </Reveal>
          <ul className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {g.list.map((m, i) => (
              <li key={m.name}>
                <PortraitCard m={m} priority={gi === 0 && i < 4} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
