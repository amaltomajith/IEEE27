import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CommitteeNav } from "@/components/pages/CommitteeNav";
import { MemberDirectory } from "@/components/pages/MemberDirectory";
import { advisory } from "@/content/committee";

export const metadata: Metadata = { title: "Advisory Boards", description: "International, Industry and National Advisory Boards of IIC 2027." };

export default function AdvisoryPage() {
  return (
    <>
      <PageHero title="Advisory Boards" emphasis="Boards" crumbs={[{ label: "Committee", href: "/committee/" }, { label: "Advisory" }]}>
        <CommitteeNav />
      </PageHero>
      <section className="wrap pb-[clamp(64px,8vw,130px)]">
        <MemberDirectory groups={advisory} />
      </section>
    </>
  );
}
