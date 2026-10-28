// Interaction audit, run with: playwright-cli run-code --filename=scripts/audit.js
// For every visible control on every route: is it reachable (not covered by an
// overlay, not invisible) at its own centre point?
async (page) => {
  const BASE = "http://localhost:4311";
  const routes = ["/", "/about/", "/committee/", "/committee/advisory/", "/committee/technical/", "/committee/organizing/",
    "/committee/publicity/", "/thematic-tracks/", "/thematic-tracks/eee-me/", "/important-dates/", "/submission/",
    "/registration/", "/programme-schedule/", "/publication/", "/venue/", "/contact/"];
  const report = [];
  for (const r of routes) {
    await page.goto(BASE + r, { waitUntil: "load" });
    await page.waitForTimeout(r === "/" ? 6500 : 1200);
    const res = await page.evaluate(async () => {
      const raf = () => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
      const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
      const out = [];
      const els = [...document.querySelectorAll("a[href],button,summary,input,[role=tab],[role=radio]")];
      for (const el of els) {
        if (el.closest("[aria-hidden=true],[inert]")) continue;
        const st = getComputedStyle(el);
        if (st.display === "none" || st.visibility === "hidden") continue;
        if (el.getClientRects().length === 0) continue;
        el.scrollIntoView({ block: "center", inline: "center" });
        await raf();
        await sleep(60);
        const b = el.getBoundingClientRect();
        if (b.width < 2 || b.height < 2) continue;
        const x = b.left + b.width / 2, y = b.top + b.height / 2;
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { out.push({ issue: "offscreen", label: lab(el), y: Math.round(y) }); continue; }
        let op = 1;
        for (let n = el; n && n !== document.body; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
        const hit = document.elementFromPoint(x, y);
        if (!hit || !(hit === el || el.contains(hit))) out.push({ issue: "covered", label: lab(el), by: hit ? hit.tagName + "." + String(hit.className).slice(0, 70) : null });
        else if (op < 0.2) out.push({ issue: "invisible-but-clickable", label: lab(el), opacity: op.toFixed(2) });
      }
      function lab(el) { return (el.getAttribute("aria-label") || el.textContent || el.getAttribute("href") || "").trim().replace(/\s+/g, " ").slice(0, 48); }
      return out;
    });
    report.push({ route: r, problems: res });
  }
  return JSON.stringify(report.filter((x) => x.problems.length), null, 1);
}
