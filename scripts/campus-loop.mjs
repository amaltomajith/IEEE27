// Builds the Kengeri campus loop that plays beside the home hero ribbon.
//
//   node scripts/campus-loop.mjs
//
// Reads assets/ (project root):
//   - a video file + assets/loop.json   -> cuts those segments, crossfades them into a seamless loop
//   - a video file without loop.json    -> writes assets/_frames.jpg (a frame every 2s, timestamped) to pick from
//   - photos only                       -> a slow push-in slideshow, crossfaded into a seamless loop
// loop.json: [{ "t": "0:42", "d": 3.5, "x": 0.5 }, ...]  t = start, d = seconds, x = horizontal focus 0..1
//
// Writes public/video/kengeri-loop.{mp4,webm}, kengeri-loop-sm.mp4 and kengeri-poster.webp, then
// set `campusVideo.local` in src/content/site.ts.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..");
const SRC = process.env.KENGERI_DIR ?? join(ROOT, "assets");
const OUT = process.env.LOOP_OUT ?? join(ROOT, "public", "video");
const TMP = join(tmpdir(), "iic-campus-loop");
const W = 1280, H = 720, FPS = 30, FADE = 0.6;

const ff = (args, label) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${label}`);
};
const probe = (file) =>
  Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).stdout);
const secs = (t) => (typeof t === "number" ? t : t.split(":").reduce((a, v) => a * 60 + Number(v), 0));

if (!existsSync(SRC)) throw new Error("Put the campus video or photos in assets/ first.");
const files = readdirSync(SRC).filter((f) => !f.startsWith("_")).sort();
const video = files.find((f) => /\.(mp4|mov|mkv|webm|m4v)$/i.test(f));
const photos = files.filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f));
mkdirSync(OUT, { recursive: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

// Each clip keeps a 16:9 frame at a common frame rate; the hero crops it to whatever space it has.
const fit = (x = 0.5) => `scale=-2:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}:(iw-${W})*${x}:(ih-${H})/2,setsar=1,fps=${FPS},format=yuv420p`;

let parts; // [{ args: ffmpeg input args, filter, d }]
if (video && existsSync(join(SRC, "loop.json"))) {
  const segs = JSON.parse(readFileSync(join(SRC, "loop.json"), "utf8"));
  parts = segs.map((s) => ({ args: ["-ss", String(secs(s.t)), "-t", String(s.d + FADE), "-i", join(SRC, video)], filter: fit(s.x), d: s.d }));
} else if (video) {
  // No segments chosen yet: a timestamped contact sheet to choose from.
  const dur = probe(join(SRC, video));
  ff(["-i", join(SRC, video), "-vf", "fps=1/2,scale=320:-2,drawtext=text='%{pts\\:hms}':x=6:y=6:fontcolor=yellow:box=1:boxcolor=black@0.6:fontsize=16,tile=6x" + Math.ceil(dur / 12), "-frames:v", "1", join(SRC, "_frames.jpg")], "contact sheet");
  console.log(`Wrote assets/_frames.jpg (${dur.toFixed(0)}s of footage). Pick segments into assets/loop.json and run again.`);
  process.exit(0);
} else if (photos.length >= 2) {
  const D = 2.6, n = Math.round((D + FADE) * FPS);
  parts = photos.map((f) => ({
    args: ["-loop", "1", "-framerate", String(FPS), "-t", String(D + FADE), "-i", join(SRC, f)],
    filter: `scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2},zoompan=z='1+0.06*on/${n}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=${W}x${H}:fps=${FPS},setsar=1,format=yuv420p`,
    d: D,
  }));
} else throw new Error("assets/ needs a video file or at least two photos.");

// Chain the parts with crossfades and fade the last one back into the first. Trimming from FADE to
// the end of that final fade makes the last frame lead straight into the first: no visible seam.
const all = [...parts, { ...parts[0], args: parts[0].args.map((a, i, arr) => (arr[i - 1] === "-t" ? String(FADE * 2) : a)) }];
let chain = all.map((p, i) => `[${i}:v]${p.filter}[v${i}]`).join(";");
let offset = 0, prev = "v0";
for (let i = 1; i < all.length; i++) {
  offset += parts[i - 1].d;
  chain += `;[${prev}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${offset.toFixed(3)}[x${i}]`;
  prev = `x${i}`;
}
const total = offset + FADE;
chain += `;[${prev}]trim=start=${FADE}:end=${total.toFixed(3)},setpts=PTS-STARTPTS[out]`;

const master = join(TMP, "master.mp4");
ff([...all.flatMap((p) => p.args), "-filter_complex", chain, "-map", "[out]", "-an", "-c:v", "libx264", "-crf", "14", "-preset", "medium", master], "master");

const x264 = ["-an", "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-preset", "slow"];
ff(["-i", master, ...x264, "-crf", "27", join(OUT, "kengeri-loop.mp4")], "mp4");
ff(["-i", master, "-an", "-c:v", "libvpx-vp9", "-crf", "38", "-b:v", "0", "-row-mt", "1", "-pix_fmt", "yuv420p", join(OUT, "kengeri-loop.webm")], "webm");
ff(["-i", master, "-vf", "scale=854:480", ...x264, "-crf", "28", join(OUT, "kengeri-loop-sm.mp4")], "small mp4");
ff(["-i", master, "-frames:v", "1", join(TMP, "poster.png")], "poster");
await sharp(join(TMP, "poster.png")).webp({ quality: 72 }).toFile(join(OUT, "kengeri-poster.webp"));

for (const f of ["kengeri-loop.mp4", "kengeri-loop.webm", "kengeri-loop-sm.mp4", "kengeri-poster.webp"]) {
  const p = join(OUT, f);
  console.log(`${f.padEnd(22)} ${(readFileSync(p).length / 1024).toFixed(0).padStart(5)} KB${f.endsWith("webp") ? "" : `  ${probe(p).toFixed(2)}s`}`);
}
