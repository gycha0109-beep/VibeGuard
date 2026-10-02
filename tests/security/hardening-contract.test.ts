import fs from "node:fs";
import { describe, expect, it } from "vitest";

const hardening = fs.readFileSync("supabase/migrations/202610020002_hardening.sql", "utf8");
const env = fs.readFileSync(".env.example", "utf8");
const admin = fs.readFileSync("app/api/admin/users/route.ts", "utf8");
const vote = fs.readFileSync("app/api/vote/route.ts", "utf8");

describe("hardening contracts", () => {
  it("SEC-001/002 binds profile access to auth.uid or admin", () => {
    expect(hardening).toMatch(/profiles_select_self_or_admin[\s\S]*auth\.uid\(\) = id/);
    expect(hardening).toMatch(/profiles_update_self_or_admin[\s\S]*auth\.uid\(\) = id/);
  });
  it("SEC-003 derives admin server-side", () => {
    expect(admin).toContain("requireAdmin");
    expect(admin).not.toContain("x-role");
  });
  it("SEC-005 has no public service-role variable", () => {
    expect(env).not.toMatch(/NEXT_PUBLIC_.*SERVICE_ROLE/);
  });
  it("SEC-007 revokes baseline definer export and gates replacement", () => {
    expect(hardening).toContain("revoke all on function public.baseline_export_events() from public");
    expect(hardening).toContain("if not private.current_user_is_admin() then raise exception 'forbidden'");
  });
  it("SEC-008 scopes storage write paths to auth.uid", () => {
    expect(hardening).toContain("storage.foldername(name))[1] = auth.uid()::text");
  });
  it("INT-001 enforces poll/user uniqueness in the database", () => {
    expect(hardening).toMatch(/unique\s*\(poll_id, user_id\)/i);
  });
  it("INT-003 vote route never accepts userId from the request", () => {
    expect(vote).not.toMatch(/body\.userId/);
    expect(vote).toContain('rpc("submit_vote"');
  });
});
