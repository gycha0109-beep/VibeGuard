import fs from "node:fs";
import { execFileSync } from "node:child_process";

const show = (ref, file) => execFileSync("git", ["show", `${ref}:${file}`], { encoding: "utf8" });
const baselineRef = (() => {
  for (const ref of ["baseline-ai-generated", "origin/baseline-ai-generated"]) {
    try { execFileSync("git", ["rev-parse", "--verify", ref], { stdio: "ignore" }); return ref; } catch {}
  }
  throw new Error("baseline ref unavailable");
})();

const metrics = (source) => ({
  raw_img_tags: (source.match(/<img\b/g) ?? []).length,
  remote_unsplash_urls: (source.match(/https:\/\/images\.unsplash\.com/g) ?? []).length,
  next_image_imports: (source.match(/from ["']next\/image["']/g) ?? []).length,
  use_effect_calls: (source.match(/\buseEffect\s*\(/g) ?? []).length,
  fetch_calls: (source.match(/\bfetch\s*\(/g) ?? []).length
});

const before = metrics(show(baselineRef, "app/contents/page.tsx"));
const after = metrics(fs.readFileSync("app/contents/page.tsx", "utf8"));
const result = { method: "source-level deterministic metrics; not runtime timing", baseline_ref: baselineRef, before, after };
console.log(JSON.stringify(result, null, 2));
if (!(before.raw_img_tags > after.raw_img_tags && before.remote_unsplash_urls > after.remote_unsplash_urls && after.next_image_imports > before.next_image_imports)) {
  process.exit(1);
}
