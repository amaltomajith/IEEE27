# IIC 2027 website

TypeScript rebuild of the International Interdisciplinary Conference 2027 site
(CHRIST (Deemed to be University), Bangalore Kengeri Campus). Content comes from the
original Google Sites export. Look: an aqua "signal" accent on navy and Instrument Sans.
Hero motion: a skewed slash bar with a gooey cursor bulge. On scroll it bends into a
thick ribbon that melts into a card holding a live brain-to-neural-network scene.

## Stack

Next.js 15 (App Router, static export), Tailwind CSS v4, Motion, Lenis, three.js,
Phosphor icons.

## Commands

```bash
npm install
npm run dev      # local dev server
npm run build    # static export to ./out
npm start        # serve ./out
```

`dev` and `build` preload `scripts/exfat-readlink.cjs`. The project sits on an exFAT
drive, where `readlink()` returns EISDIR for regular files and breaks webpack. The shim
maps that error to EINVAL. It does nothing on NTFS or other filesystems.

Verification without disturbing a running `npm run dev` (it owns `.next`):

```bash
# production server build into a separate folder, then serve it
NEXT_NO_EXPORT=1 NEXT_DIST_DIR=.next-claude node -r ./scripts/exfat-readlink.cjs node_modules/next/dist/bin/next build
NEXT_NO_EXPORT=1 NEXT_DIST_DIR=.next-claude node -r ./scripts/exfat-readlink.cjs node_modules/next/dist/bin/next start -p 4311
# interaction audit (every visible control reachable and visible), via playwright-cli
playwright-cli run-code --filename=scripts/audit.js
```

Do not run `npm run build` while `npm run dev` is running: both write `.next`, and the dev
server breaks (HTTP 500) until it is restarted. In dev on this exFAT drive, a page loaded
while webpack is mid-rebuild can receive a half-written chunk and fail to hydrate (every
button dead). Reload once the terminal shows "Compiled"; production builds are unaffected.

## Where things live

- `src/content/*.ts`: every fact on the site (dates, fees, tracks, committee, contacts).
  Edit content here, not in components.
- `src/components/hero/`: the homepage hero.
  - `shader.ts`: SDF fragment shader: slanted bar, capsule ribbon, box morph and cursor droplets.
  - `engine.ts`: geometry, the scroll-driven ribbon, the card morph, bulge physics and the loader handoff.
  - `Loader.tsx`: liquid-fill slash, progress ring and letter rise. It plays once per browser session.
- `src/components/scene/`: the thinking system (`ThinkingSystem.ts`, `layout.ts`, `shaders.ts`):
  brain-shaped neurons and synapses with cursor-triggered cascades; press and hold to rearrange
  into a layered neural network. `Takeover.tsx` is its full-screen view.
- `src/components/ui/`: buttons (`PillButton.tsx`, 14px rectangles; magnetic offset and press
  scale are composed CSS variables), `Field.tsx` (dot field), header and menu (the menu stays up
  until the next page has rendered), `NavProgress.tsx` (top bar while a navigation is pending),
  and the footer with its springy `FooterSlash.tsx`.
- `src/lib/scroll.ts`: Lenis handle and a ref-counted scroll lock (loader, menu, takeover).
- `src/lib/frame.ts`: the one requestAnimationFrame loop for the whole site. Lenis advances first,
  then canvas subscribers run.

## Content corrections against the source site

- On the source Important Dates page, the last five rows say 2026. They are shown as 2027 here,
  because the hero banner and the Registration page both say 2027.
- Fixed typos: "Consultatnt", "Professer", "Dr..Domnic", "Abdelmaled Essadi".
- Dropped Dr. Ganesan Palanisamy's profile link, because it pointed to a different person.
- Rewrote em dashes as plain punctuation.
