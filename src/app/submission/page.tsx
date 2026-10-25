import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { PillButton } from "@/components/ui/PillButton";
import { SubmissionTabs } from "@/components/pages/SubmissionTabs";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Paper Submission", description: "Guidelines for extended abstracts and full manuscripts for IIC 2027." };

export default function SubmissionPage() {
  return (
    <>
      <PageHero title="Two Ways to Submit" emphasis="Submit" crumbs={[{ label: "Paper Submission" }]} intro="Send an extended abstract by 20 October 2026, or a full manuscript by 1 December 2026.">
        <div className="flex flex-wrap gap-3">
          <PillButton href={site.portals.submission} variant="brand">Paper Submission Portal</PillButton>
          <PillButton href={site.portals.submission} variant="ghost">Reviewer Portal</PillButton>
        </div>
      </PageHero>
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <SubmissionTabs />
      </section>
    </>
  );
}
