import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const files = {
  hardening: read("supabase/migrations/202610020002_hardening.sql"),
  env: read(".env.example"),
  admin: read("app/api/admin/users/route.ts"),
  vote: read("app/api/vote/route.ts")
};
const checks = [
  ["SEC-001 self-bound profile policy", /profiles_select_self_or_admin[\s\S]*auth\.uid\(\) = id/, files.hardening],
  ["SEC-003 no x-role trust", /x-role/, files.admin, true],
  ["SEC-005 no public service-role env", /NEXT_PUBLIC_.*SERVICE_ROLE/, files.env, true],
  ["SEC-007 admin-gated export", /admin_export_events[\s\S]*current_user_is_admin/, files.hardening],
  ["SEC-008 storage owner path", /storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/, files.hardening],
  ["INT-001 DB unique vote invariant", /unique\s*\(poll_id, user_id\)/i, files.hardening],
  ["INT-003 vote route ignores request userId", /body\.userId/, files.vote, true]
];
let failed = 0;
for (const [name, pattern, body, mustBeAbsent = false] of checks) {
  const matched = pattern.test(body);
  const pass = mustBeAbsent ? !matched : matched;
  console.log(`${pass ? "PASS" : "FAIL"} ${name}`);
  if (!pass) failed += 1;
}
console.log(JSON.stringify({ checks: checks.length, failed }, null, 2));
if (failed) process.exit(1);
