import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { contacts, conferenceEmail, generalTopics } from "@/content/contact";

export const metadata: Metadata = { title: "Contact", description: `Contact the IIC 2027 organisers at ${conferenceEmail}.` };

export default function ContactPage() {
  return (
    <>
      <PageHero title="Say hello" emphasis="hello" crumbs={[{ label: "Contact" }]} intro="Pick the right person below, or write to the conference inbox for anything else." />
      <section className="wrap grid gap-[clamp(32px,4vw,72px)] pb-[clamp(64px,8vw,130px)] lg:grid-cols-[0.75fr_1.25fr]">
        <Reveal className="hidden lg:block">
          <div className="fade-up relative aspect-[1192/1400] overflow-hidden rounded-[var(--radius-l)] bg-white">
            <Image src="/images/brand/iic-emblem.webp" alt="IIC 2027 conference emblem: Mind and Machine" fill sizes="35vw" className="object-contain p-6" />
          </div>
        </Reveal>
        <div className="space-y-3">
          <a href={`mailto:${conferenceEmail}`} className="glow-bottom group relative block overflow-hidden rounded-[var(--radius-l)] bg-navy p-[clamp(24px,3vw,48px)] text-white">
            <p className="text-muted-dark">Conference email</p>
            <p className="mt-3 text-[clamp(22px,2.4vw,40px)] font-medium tracking-[-0.02em] break-words group-hover:text-signal">
              {conferenceEmail.split("@")[0]}
              <wbr />@{conferenceEmail.split("@")[1]}
            </p>
            <p className="mt-6 max-w-[52ch] text-white/70">For {generalTopics.slice(0, -1).join(", ").toLowerCase()} and {generalTopics.at(-1)!.toLowerCase()}.</p>
            <ArrowUpRight size={28} className="absolute top-8 right-8 text-signal transition-transform group-hover:rotate-45" />
          </a>
          <div className="grid gap-3 md:grid-cols-3">
            {contacts.map((c) => (
              <a key={c.topic} href={`mailto:${c.email}`} className="group flex flex-col justify-between gap-8 rounded-[var(--radius-m)] bg-white p-6 ring-1 ring-navy/5 transition hover:ring-signal">
                <p className="text-sm text-muted">{c.topic}</p>
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-[15px] break-words text-navy/70 group-hover:text-signal-ink">
                    {c.email.split("@")[0]}
                    <wbr />@{c.email.split("@")[1]}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
