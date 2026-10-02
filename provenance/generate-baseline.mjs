import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const model = process.env.BASELINE_MODEL || "openai/gpt-4.1";
const outputPath = process.argv[2];
if (!outputPath) throw new Error("Usage: node provenance/generate-baseline.mjs <model-output.txt>");

const brief = fs.readFileSync("provenance/client-brief.md", "utf8");
const prompt = fs.readFileSync("provenance/generation-prompt.md", "utf8");
const promptHash = crypto.createHash("sha256").update(brief + "\n---\n" + prompt).digest("hex");

let content = fs.readFileSync(outputPath, "utf8").trim();
content = content.replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");

const first = content.indexOf("{");
const last = content.lastIndexOf("}");
if (first < 0 || last <= first) throw new Error("Model output did not contain a JSON object");
content = content.slice(first, last + 1);

const bundle = JSON.parse(content);
if (!Array.isArray(bundle.files) || bundle.files.length < 8) throw new Error("Generated bundle too small");

const deniedPrefixes = [".github/", "provenance/", ".git/", "node_modules/", ".next/", "dist/", "build/"];
const allowedHidden = new Set([".env.example", ".gitignore"]);
const seen = new Set();

for (const file of bundle.files) {
  if (!file || typeof file.path !== "string" || typeof file.content !== "string") throw new Error("Invalid file entry");
  const p = file.path.replaceAll("\\", "/");
  if (path.isAbsolute(p) || p.includes("..") || p.startsWith("/")) throw new Error(`Unsafe path: ${p}`);
  if (deniedPrefixes.some((prefix) => p.startsWith(prefix))) throw new Error(`Reserved path: ${p}`);
  if (p.startsWith(".") && !allowedHidden.has(p)) throw new Error(`Unexpected hidden file: ${p}`);
  if (seen.has(p)) throw new Error(`Duplicate path: ${p}`);
  seen.add(p);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, file.content);
}

for (const required of ["package.json","README.md","app/layout.tsx","app/page.tsx","app/globals.css","tsconfig.json"]) {
  if (!seen.has(required)) throw new Error(`Missing required file: ${required}`);
}
if (![...seen].some((p) => p.startsWith("supabase/migrations/") && p.endsWith(".sql"))) {
  throw new Error("Missing Supabase migration");
}

const record = {
  schemaVersion: 1,
  generator: "GitHub Models via gh-models CLI",
  model,
  promptSha256: promptHash,
  workflowRunId: process.env.GITHUB_RUN_ID ?? null,
  workflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
  workflowSourceCommit: process.env.GITHUB_SHA ?? null,
  generatedAtUtc: new Date().toISOString(),
  generatedFiles: [...seen].sort(),
  notes: typeof bundle.notes === "string" ? bundle.notes : null,
  humanCodeEditsBeforeFreeze: false
};
fs.writeFileSync("provenance/generation-record.json", JSON.stringify(record, null, 2) + "\n");
console.log(JSON.stringify({model, promptHash, files: seen.size}, null, 2));
