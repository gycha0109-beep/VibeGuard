import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const rawMigration = fs.readFileSync(path.join(root, "supabase/migrations/202610020001_baseline.sql"), "utf8");
const migration = rawMigration.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");
const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
const adminRoute = fs.readFileSync(path.join(root, "app/api/admin/users/route.ts"), "utf8");

describe("security acceptance contracts", () => {
  it("SEC-001/002 does not contain globally permissive profile policies", () => {
    expect(migration).not.toMatch(/baseline_profiles_(read|update)_all/);
  });

  it("SEC-003 does not trust a client supplied x-role header", () => {
    expect(adminRoute).not.toContain('headers.get("x-role")');
  });

  it("SEC-005 never exposes a service-role variable through NEXT_PUBLIC", () => {
    expect(envExample).not.toMatch(/NEXT_PUBLIC_.*SERVICE_ROLE/);
  });

  it("INT-001 has a DB unique invariant for poll and user", () => {
    expect(migration).toMatch(/unique\s*\(\s*poll_id\s*,\s*user_id\s*\)/i);
  });
});
