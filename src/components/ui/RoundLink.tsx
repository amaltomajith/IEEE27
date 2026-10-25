import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

/**
 * The site's round arrow button for leaving to another site: pinned to a photo's bottom-right corner so
 * it sits in the same place on every card. It fills brand blue and the arrow turns on hover.
 */
export function RoundLink({ href, label, title }: { href: string; label: string; title?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      title={title}
      className="group/p absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-white text-brand-ink shadow-[0_6px_16px_-8px_rgb(10_26_64/0.35)] ring-1 ring-ink/10 transition duration-300 hover:bg-brand hover:text-paper hover:ring-brand active:scale-95"
    >
      <ArrowUpRight size={16} weight="bold" className="transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover/p:rotate-45" />
    </a>
  );
}
