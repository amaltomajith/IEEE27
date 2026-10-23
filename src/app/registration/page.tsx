import type { Metadata } from "next";
import { Bed, Info } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { FeeMatrix } from "@/components/pages/FeeMatrix";
import { accommodation, feeNotes } from "@/content/fees";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Registration", description: "Registration fees for IIC 2027: national and international, early bird and regular." };

export default function RegistrationPage() {
  return (
    <>
      <PageHero title="Registration fees" emphasis="fees" crumbs={[{ label: "Registration" }]} intro="Early bird rates close on 15 January 2027. Regular registration closes on 30 January 2027." />
      <section className="wrap pb-[clamp(56px,7vw,110px)]">
        <FeeMatrix />
      </section>
      <section className="wrap grid gap-3 pb-[clamp(64px,8vw,130px)] lg:grid-cols-[1.1fr_1fr]">
        <Reveal className="rounded-[var(--radius-l)] bg-white p-[clamp(24px,3vw,48px)] ring-1 ring-ink/5">
          <div className="fade-up">
            <Info size={28} className="mb-6 text-brand-ink" />
            <h2 className="t-h3 mb-5">What the fee covers</h2>
            <ul className="space-y-3 text-ink/80">
              {feeNotes.map((n) => (
                <li key={n} className="flex gap-3"><span aria-hidden className="node mt-[0.55em] text-[9px]" />{n}</li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal className="glow-bottom relative overflow-hidden rounded-[var(--radius-l)] bg-brand-soft p-[clamp(24px,3vw,48px)] text-ink">
          <div className="fade-up">
            <Bed size={28} className="mb-6 text-brand-ink" />
            <h2 className="t-h3 mb-5">Accommodation</h2>
            <p className="text-ink/75">{accommodation}</p>
            <div className="mt-8">
              <PillButton href="/contact/" variant="ghost">Ask about rooms</PillButton>
            </div>
          </div>
        </Reveal>
      </section>
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <p className="text-muted">Questions about registration? Write to <a className="text-ink underline decoration-brand decoration-2 underline-offset-4" href={`mailto:${site.email}`}>{site.email}</a>.</p>
      </section>
    </>
  );
}
