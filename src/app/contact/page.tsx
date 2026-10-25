import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { contacts, conferenceEmail, generalTopics } from "@/content/contact";
import { MailLink } from "@/components/ui/MailLink";

export const metadata: Metadata = { title: "Contact", description: `Contact the IIC 2027 organisers at ${conferenceEmail}.` };

export default function ContactPage() {
  return (
    <>
      <PageHero title="Say Hello" emphasis="Hello" crumbs={[{ label: "Contact" }]} intro="Pick the right person below, or write to the conference inbox for anything else." />
      <section className="wrap grid gap-[clamp(32px,4vw,72px)] pb-[clamp(64px,8vw,130px)] lg:grid-cols-[0.75fr_1.25fr]">
        <Reveal className="hidden lg:block">
          <div className="fade-up relative aspect-[1192/1400] overflow-hidden rounded-[var(--radius-l)] bg-white">
            <Image src="/images/brand/iic-emblem.webp" alt="IIC 2027 conference emblem: Mind and Machine" fill sizes="35vw" className="object-contain p-6" />
          </div>
        </Reveal>
        <div className="min-w-0 space-y-3">
          <MailLink to={conferenceEmail} className="glow-bottom group relative block overflow-hidden rounded-[var(--radius-l)] bg-brand-soft p-[clamp(24px,3vw,48px)] text-ink">
            <p className="text-muted">Conference Email</p>
            <p className="mt-3 font-display font-semibold text-[clamp(26px,2.7vw,44px)] leading-tight [font-variant-numeric:lining-nums] [overflow-wrap:anywhere] group-hover:text-brand-deep">
              {conferenceEmail.split("@")[0]}
              <wbr />@{conferenceEmail.split("@")[1]}
            </p>
            <p className="mt-6 max-w-[52ch] text-ink/70">For {generalTopics.slice(0, -1).join(", ").toLowerCase()} and {generalTopics.at(-1)!.toLowerCase()}.</p>
            <ArrowUpRight size={28} className="absolute top-8 right-8 text-brand-ink transition-transform group-hover:rotate-45" />
          </MailLink>
          <div className="grid gap-3 md:grid-cols-3">
            {contacts.map((c) => (
              <MailLink key={c.topic} to={c.email} subject={`IIC 2027: ${c.topic}`} greeting={c.name ? `Dear ${c.name},` : undefined} className="group flex flex-col justify-between gap-8 rounded-[var(--radius-m)] bg-white p-6 ring-1 ring-ink/5 transition hover:ring-brand">
                <p className="text-sm text-muted">{c.topic}</p>
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-[15px] [overflow-wrap:anywhere] text-ink/70 group-hover:text-brand-ink">
                    {c.email.split("@")[0]}
                    <wbr />@{c.email.split("@")[1]}
                  </p>
                </div>
              </MailLink>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
