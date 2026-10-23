import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { PillButton } from "@/components/ui/PillButton";
import { DatesTimeline } from "@/components/pages/DatesTimeline";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Important Dates", description: "Submission, notification, registration and conference dates for IIC 2027." };

export default function DatesPage() {
  return (
    <>
      <PageHero title="Important dates" emphasis="dates" crumbs={[{ label: "Important Dates" }]} intro="Abstracts open the process in October 2026. The conference runs March 2-3, 2027.">
        <div className="flex flex-wrap gap-3">
          <PillButton href={site.portals.submission} variant="wine">Submit extended abstract</PillButton>
          <PillButton href={site.portals.submission} variant="ghost">Submit full manuscript</PillButton>
        </div>
      </PageHero>
      <section className="wrap grid gap-12 pb-[clamp(64px,8vw,130px)] lg:grid-cols-[0.6fr_1fr]">
        <div className="text-muted lg:pt-4">
          <p className="max-w-[34ch]">All dates are in Indian Standard Time. For more details, see the <a className="text-cocoa underline decoration-wine decoration-2 underline-offset-4" href="/submission/">submission guidelines</a> or <a className="text-cocoa underline decoration-wine decoration-2 underline-offset-4" href="/contact/">contact the organisers</a>.</p>
        </div>
        <DatesTimeline />
      </section>
    </>
  );
}
