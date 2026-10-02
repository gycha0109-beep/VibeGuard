import { describe, expect, it } from "vitest";

class BaselineVoteStore {
  rows: Array<{ pollId: string; userId: string }> = [];
  submit(pollId: string, userId: string) { this.rows.push({ pollId, userId }); }
}

describe("duplicate request acceptance", () => {
  it("INT-002 repeated identical requests should persist exactly one vote", async () => {
    const store = new BaselineVoteStore();
    await Promise.all(Array.from({ length: 8 }, async () => store.submit("p1", "u1")));
    expect(store.rows.filter((r) => r.pollId === "p1" && r.userId === "u1")).toHaveLength(1);
  });
});
