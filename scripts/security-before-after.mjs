import fs from "node:fs";
import { execFileSync } from "node:child_process";

const show = (ref, file) => execFileSync("git", ["show", `${ref}:${file}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
const current = (file) => fs.readFileSync(file, "utf8");
const stripSqlComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");

function evaluate(read) {
  const baseline = stripSqlComments(read("supabase/migrations/202610020001_baseline.sql"));
  let hardening = "";
  try { hardening = stripSqlComments(read("supabase/migrations/202610020002_hardening.sql")); } catch {}
  const admin = read("app/api/admin/users/route.ts");
  const env = read(".env.example");
  const combinedSql = `${baseline}\n${hardening}`;
  return {
    "SEC-001": /profiles_select_self_or_admin[\s\S]*auth\.uid\(\) = id/.test(hardening) && /drop policy if exists "baseline_profiles_read_all"/.test(hardening),
    "SEC-002": /profiles_update_self_or_admin[\s\S]*auth\.uid\(\) = id/.test(hardening) && /drop policy if exists "baseline_profiles_update_all"/.test(hardening),
    "SEC-003": !/x-role/.test(admin) && /requireAdmin/.test(admin),
    "SEC-005": !/NEXT_PUBLIC_.*SERVICE_ROLE/.test(env),
    "SEC-007": /admin_export_events[\s\S]*current_user_is_admin/.test(hardening),
    "SEC-008": /storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/.test(hardening),
    "INT-001": /unique\s*\(poll_id, user_id\)/i.test(combinedSql)
  };
}

const before = evaluate((file) => show("baseline-ai-generated", file));
const after = evaluate(current);
const summary = {
  generated_at: new Date().toISOString(),
  method: "source-and-migration-contract; not a substitute for live Supabase RLS execution",
  baseline_ref: "baseline-ai-generated",
  before,
  after,
  before_pass: Object.values(before).filter(Boolean).length,
  after_pass: Object.values(after).filter(Boolean).length,
  total: Object.keys(after).length
};
console.log(JSON.stringify(summary, null, 2));
if (summary.before_pass !== 0 || summary.after_pass !== summary.total) process.exit(1);
