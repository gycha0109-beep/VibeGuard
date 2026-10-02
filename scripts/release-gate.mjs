import { spawnSync } from "node:child_process";

const commands = [
  ["static-security", "node", ["scripts/static-security-audit.mjs"]],
  ["before-after-contract", "node", ["scripts/security-before-after.mjs"]],
  ["typecheck", "npm", ["run", "typecheck"]],
  ["lint", "npm", ["run", "lint"]],
  ["tests", "npm", ["test"]],
  ["build", "npm", ["run", "build"]],
  ["e2e", "npm", ["run", "test:e2e"]]
];
const checks = [];
for (const [name, command, args] of commands) {
  const run = spawnSync(command, args, { stdio: "inherit", env: { ...process.env, VIBEGUARD_SYNTHETIC_MODE: "true" } });
  checks.push({ name, pass: run.status === 0 });
  if (run.status !== 0) break;
}
const pass = checks.length === commands.length && checks.every((check) => check.pass);
console.log(JSON.stringify({ gate: pass ? "PASS" : "FAIL", checks }, null, 2));
process.exit(pass ? 0 : 1);
