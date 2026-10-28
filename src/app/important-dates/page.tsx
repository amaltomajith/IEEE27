import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { PillButton } from "@/components/ui/PillButton";
import { DatesTimeline } from "@/components/pages/DatesTimeline";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Important Dates", description: "Submission, notification, registration and conference dates for IIC 2027." };

export default function DatesPage() {
  return (
    <>
      <PageHero title="Important Dates" emphasis="Dates" crumbs={[{ label: "Important Dates" }]} intro="Extended abstracts are due 25 November 2026. The conference runs 2-3 March 2027.">
        <div className="flex flex-wrap gap-3">
          <PillButton href={site.portals.submission} variant="brand">Submit Extended Abstract</PillButton>
          <PillButton href={site.portals.submission} variant="ghost">Submit Full Manuscript</PillButton>
        </div>
      </PageHero>
      <section className="wrap grid gap-12 pb-[clamp(64px,8vw,130px)] lg:grid-cols-[0.6fr_1fr]">
        <div className="text-muted lg:pt-4">
          <p className="max-w-[34ch]">All dates are in Indian Standard Time. For more details, see the <a className="text-ink underline decoration-brand decoration-2 underline-offset-4" href="/submission/">submission guidelines</a> or <a className="text-ink underline decoration-brand decoration-2 underline-offset-4" href="/contact/">contact the organisers</a>.</p>
        </div>
        <DatesTimeline />
      </section>
    </>
  );
}
