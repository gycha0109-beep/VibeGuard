import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const model = "openai/gpt-4.1";
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error("GITHUB_TOKEN missing");

const brief = fs.readFileSync("provenance/client-brief.md", "utf8");
const prompt = fs.readFileSync("provenance/generation-prompt.md", "utf8");
const promptHash = crypto.createHash("sha256").update(brief + "\n---\n" + prompt).digest("hex");

const response = await fetch("https://models.github.ai/inference/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify({
    model,
    temperature: 0.15,
    max_tokens: 16000,
    messages: [
      {
        role: "system",
        content: "Generate a compact production-buildable codebase. Return only the exact JSON object requested by the user. Never wrap it in markdown fences."
      },
      {
        role: "user",
        content: prompt + "\n\nCLIENT BRIEF:\n" + brief
      }
    ]
  })
});

const raw = await response.text();
if (!response.ok) throw new Error(`GitHub Models request failed: ${response.status} ${raw}`);

fs.mkdirSync("provenance/raw", { recursive: true });
fs.writeFileSync("provenance/raw/github-models-response.json", raw);

const api = JSON.parse(raw);
let content = api?.choices?.[0]?.message?.content;
if (typeof content !== "string") throw new Error("Model returned no message content");
content = content.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");

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

const requiredAny = [
  ["package.json"],
  ["README.md"],
  ["app/layout.tsx"],
  ["app/page.tsx"],
  ["app/globals.css"],
  ["tsconfig.json"],
];
for (const variants of requiredAny) {
  if (!variants.some((p) => seen.has(p))) throw new Error(`Missing required file: ${variants.join(" or ")}`);
}
if (![...seen].some((p) => p.startsWith("supabase/migrations/") && p.endsWith(".sql"))) {
  throw new Error("Missing Supabase migration");
}

const record = {
  schemaVersion: 1,
  model,
  temperature: 0.15,
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
