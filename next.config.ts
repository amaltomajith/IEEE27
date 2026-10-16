import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_NO_EXPORT=1 builds a regular server build (used for local verification with `next start`).
  output: process.env.NEXT_NO_EXPORT ? undefined : "export",
  // Separate build dir for tooling runs, so they never clobber a running `npm run dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  trailingSlash: true,
  images: { unoptimized: true },
  // Pin the workspace root: a stray lockfile in the parent folder would otherwise make
  // Next crawl the neighbouring site clones.
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: true,
};

export default nextConfig;
