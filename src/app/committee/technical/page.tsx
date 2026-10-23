import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { PillButton } from "@/components/ui/PillButton";
import { CommitteeNav } from "@/components/pages/CommitteeNav";
import { MemberDirectory } from "@/components/pages/MemberDirectory";
import { technical, tpcIntro } from "@/content/committee";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Technical Program Committee", description: tpcIntro };

export default function TechnicalPage() {
  return (
    <>
      <PageHero
        title="Technical Program Committee"
        emphasis="Program"
        crumbs={[{ label: "Committee", href: "/committee/" }, { label: "Technical" }]}
        intro={`${tpcIntro}.`}
      >
        <div className="flex flex-col items-start gap-8">
          <PillButton href={site.portals.tpc} variant="brand">Join the TPC</PillButton>
          <CommitteeNav />
        </div>
      </PageHero>
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <MemberDirectory groups={technical} />
      </section>
    </>
  );
}
