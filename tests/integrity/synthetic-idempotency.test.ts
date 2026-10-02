import { beforeEach, describe, expect, it } from "vitest";
import { resetSyntheticStore, submitSyntheticVote } from "../../lib/synthetic-store";

beforeEach(() => resetSyntheticStore());

describe("secret-free integrity model", () => {
  it("INT-002 rapid duplicate submissions produce one logical vote", async () => {
    const results = await Promise.all(Array.from({ length: 20 }, async () => submitSyntheticVote("p1", "like", "u1")));
    expect(results.filter((result) => result.inserted)).toHaveLength(1);
    expect(results.at(-1)?.count).toBe(1);
  });
});
