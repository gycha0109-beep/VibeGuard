import { test, expect } from "@playwright/test";

test("BROWSER core hardened flow has no browser errors and emits funnel events", async ({ page }, testInfo) => {
  const errors: string[] = [];
  const eventNames = new Set<string>();

  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.method() !== "POST") return;
    try {
      if (new URL(request.url()).pathname !== "/api/events") return;
      const payload = request.postDataJSON() as { event_name?: string };
      if (payload.event_name) eventNames.add(payload.event_name);
    } catch {
      // Non-JSON traffic is irrelevant to this event assertion.
    }
  });

  await page.goto("/contents");
  await expect(page.getByRole("heading", { name: "오늘의 이미지" })).toBeVisible();
  await expect(page.locator("img")).toHaveCount(3);
  await expect.poll(() => eventNames.has("content_viewed")).toBe(true);

  const firstCard = page.locator("article").first();
  await firstCard.getByRole("button", { name: "좋아요 투표" }).click();
  await expect(firstCard.getByRole("button", { name: "투표 완료" })).toBeVisible();
  await expect(firstCard.getByText(/현재 \d+표/)).toBeVisible();
  await expect.poll(() => eventNames.has("vote_started")).toBe(true);
  await expect.poll(() => eventNames.has("result_viewed")).toBe(true);

  await testInfo.attach("contents-hardened", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png"
  });

  await firstCard.getByRole("link", { name: "편집 참여" }).click();
  await expect(page.getByRole("heading", { name: "캡션 편집" })).toBeVisible();
  await expect.poll(() => eventNames.has("edit_started")).toBe(true);
  await page.getByRole("textbox").fill("regression evidence");
  await page.getByRole("button", { name: "참여 완료" }).click();
  await expect.poll(() => eventNames.has("edit_completed")).toBe(true);

  await testInfo.attach("edit-flow", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png"
  });

  expect(errors).toEqual([]);
});

test("INT-002 duplicate HTTP submissions collapse to one logical vote", async ({ request }, testInfo) => {
  const pollId = `e2e-${testInfo.project.name}`;
  const body = { pollId, option: "like", sessionId: `session-${testInfo.project.name}` };
  const responses = await Promise.all(Array.from({ length: 12 }, () => request.post("/api/vote", {
    headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
    data: body
  })));
  expect(responses.every((response) => response.ok())).toBe(true);
  const payloads = await Promise.all(responses.map((response) => response.json() as Promise<{ duplicate: boolean; count: number }>));
  expect(payloads.filter((payload) => !payload.duplicate)).toHaveLength(1);
  expect(payloads.at(-1)?.count).toBe(1);
});

test("SEC-003 synthetic mode never grants admin privilege", async ({ request }) => {
  const response = await request.get("/api/admin/users", { headers: { "x-role": "admin" } });
  expect(response.status()).toBe(401);
});

test("OBS health and readiness are explicit", async ({ request }) => {
  const health = await request.get("/api/health");
  const readiness = await request.get("/api/readiness");
  expect(health.status()).toBe(200);
  expect(readiness.status()).toBe(200);
  expect(await health.json()).toMatchObject({ status: "ok", service: "vibeguard" });
  expect(await readiness.json()).toMatchObject({ status: "ready", mode: "synthetic" });
});
