import Link from "next/link";

/** "/IIC.2027" wordmark set in the display face (Cormorant Garamond). */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-display leading-none [font-variant-numeric:lining-nums] ${className}`}>
      <span aria-hidden className="mr-[0.12em] inline-block h-[0.74em] w-[0.16em] -skew-x-[37deg] rounded-[0.03em] bg-brand" />
      <span className="font-bold">IIC</span>
      <span aria-hidden className="mx-[0.04em] inline-block size-[0.2em] translate-y-[-0.02em] rounded-full bg-brand" />
      <span className="font-semibold">2027</span>
    </span>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="IIC 2027 home" className={`text-[clamp(28px,2.1vw,36px)] ${className}`}>
      <Wordmark />
    </Link>
  );
}
