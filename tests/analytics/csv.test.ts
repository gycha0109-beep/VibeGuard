import { describe, expect, it } from "vitest";
import { EVENT_EXPORT_COLUMNS, csvEscape, eventsToCsv } from "../../lib/analytics/csv";

describe("authorized event CSV serialization", () => {
  it("uses a stable column order and RFC-style quote escaping", () => {
    const csv = eventsToCsv([{
      event_name: "content_viewed",
      user_id: null,
      session_id: "session-1",
      content_id: "content-1",
      occurred_at: "2026-10-02T00:00:00.000Z",
      source: "web",
      version: 1,
      properties: { label: "a,b\"c" }
    }]);
    expect(csv.split("\n")[0]).toBe(EVENT_EXPORT_COLUMNS.join(","));
    expect(csv).toContain('"{""label"":""a,b""""c""}"');
  });

  it("neutralizes spreadsheet formula prefixes", () => {
    expect(csvEscape("=HYPERLINK(\"https://example.invalid\")")).toBe(
      '"\'=HYPERLINK(""https://example.invalid"")"'
    );
    expect(csvEscape("+1+1")).toBe('"\'+1+1"');
    expect(csvEscape("@SUM(A1:A2)")).toBe('"\'@SUM(A1:A2)"');
  });
});
