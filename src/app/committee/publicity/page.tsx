import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CommitteeNav } from "@/components/pages/CommitteeNav";
import { publicity } from "@/content/committee";

export const metadata: Metadata = { title: "Publicity", description: "Publicity team of IIC 2027." };

export default function PublicityPage() {
  return (
    <>
      <PageHero title="Publicity team" emphasis="team" crumbs={[{ label: "Committee", href: "/committee/" }, { label: "Publicity" }]}>
        <CommitteeNav />
      </PageHero>
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <div className="glow-bottom relative overflow-hidden rounded-[var(--radius-l)] bg-wine-soft p-[clamp(28px,4vw,72px)] text-cocoa">
          <p className="text-muted">{publicity.team}</p>
          <p className="t-h2 mt-4 max-w-[18ch]">
            {publicity.social.replace(" Team", "")} <span className="em text-wine-ink">team</span>
          </p>
          <p className="mt-6 max-w-[40ch] text-lg text-cocoa/70">{publicity.socialOrg}</p>
        </div>
      </section>
    </>
  );
}
