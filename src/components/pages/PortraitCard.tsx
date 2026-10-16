import Image from "next/image";
import type { Member } from "@/content/committee";

export function PortraitCard({ m, priority = false }: { m: Member; priority?: boolean }) {
  const body = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-m)] bg-gray">
        {m.photo && (
          <Image
            src={m.photo}
            alt={`Portrait of ${m.name}`}
            fill
            priority={priority}
            sizes="(min-width:1024px) 22vw, (min-width:640px) 45vw, 90vw"
            className="object-cover object-top grayscale-[0.15] transition duration-700 group-hover:scale-[1.04] group-hover:grayscale-0"
          />
        )}
        <span aria-hidden className="node absolute bottom-4 left-4 text-[12px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <p className="mt-4 text-lg leading-snug font-medium">{m.name}</p>
      {m.role && <p className="mt-1 text-[15px] leading-snug text-muted">{m.role}{m.org ? `, ${m.org}` : ""}</p>}
    </>
  );
  return m.url ? (
    <a href={m.url} target="_blank" rel="noopener noreferrer" className="group block">{body}</a>
  ) : (
    <div className="group">{body}</div>
  );
}
