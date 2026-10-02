import fs from "node:fs";
import { describe, expect, it } from "vitest";

const activeSecurity = fs.readdirSync("tests/security").filter((name) => name.endsWith(".test.ts"));
const activeIntegrity = fs.readdirSync("tests/integrity").filter((name) => name.endsWith(".test.ts"));

describe("release suite shape", () => {
  it("does not execute intentionally failing baseline fixtures", () => {
    expect([...activeSecurity, ...activeIntegrity].some((name) => name.includes("baseline"))).toBe(false);
  });
});
