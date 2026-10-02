export const EVENT_EXPORT_COLUMNS = [
  "event_name",
  "user_id",
  "session_id",
  "content_id",
  "occurred_at",
  "source",
  "version",
  "properties"
] as const;

function normalizeCell(value: unknown) {
  const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

export function csvEscape(value: unknown) {
  const safe = normalizeCell(value);
  return `"${safe.replaceAll('"', '""')}"`;
}

export function eventsToCsv(rows: ReadonlyArray<Record<string, unknown>>) {
  return [
    EVENT_EXPORT_COLUMNS.join(","),
    ...rows.map((row) => EVENT_EXPORT_COLUMNS.map((key) => csvEscape(row[key])).join(","))
  ].join("\n");
}
