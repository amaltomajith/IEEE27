import type { ReactNode } from "react";
import { gmailCompose } from "@/lib/mail";

/** Every email address on the site opens a prefilled Gmail draft in a new tab, never a bare mailto:. */
export function MailLink({ to, subject, greeting, className, children }: { to: string; subject?: string; greeting?: string; className?: string; children: ReactNode }) {
  return (
    <a href={gmailCompose(to, subject, greeting)} target="_blank" rel="noopener noreferrer" className={className} title={`Write to ${to} in Gmail`}>
      {children}
    </a>
  );
}
