import fs from "node:fs";

function withoutSqlComments(input) {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "");
}

const migrationPath = "supabase/migrations/202610020001_baseline.sql";
const migration = withoutSqlComments(fs.readFileSync(migrationPath, "utf8"));
const files = {
  migration,
  admin: fs.readFileSync("app/api/admin/users/route.ts", "utf8"),
  env: fs.readFileSync(".env.example", "utf8")
};

const checks = [
  ["SEC-001 permissive profile read", /baseline_profiles_read_all/, files.migration, true],
  ["SEC-003 client role trust", /x-role/, files.admin, true],
  ["SEC-005 public service-role naming", /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/, files.env, true],
  ["INT-001 missing unique invariant", /unique\s*\(\s*poll_id\s*,\s*user_id\s*\)/i, files.migration, false]
];

let confirmed = 0;
for (const [name, pattern, body, shouldExist] of checks) {
  const exists = pattern.test(body);
  const findingPresent = shouldExist ? exists : !exists;
  console.log(`${findingPresent ? "EXPECTED-FAIL" : "UNEXPECTED"} ${name}`);
  if (findingPresent) confirmed += 1;
}

console.log(JSON.stringify({ baseline_findings_confirmed: confirmed, expected: checks.length }, null, 2));
if (confirmed !== checks.length) process.exit(1);
