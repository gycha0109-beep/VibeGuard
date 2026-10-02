export type ClientEventName =
  | "session_started"
  | "content_viewed"
  | "edit_started"
  | "edit_completed"
  | "vote_started"
  | "result_viewed"
  | "share_clicked";

function getSessionId() {
  const existing = sessionStorage.getItem("vg-session");
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem("vg-session", created);
  return created;
}

async function postEvent(
  eventName: ClientEventName,
  sessionId: string,
  contentId: string | null,
  dedupeKey: string,
  properties: Record<string, unknown>
) {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      event_name: eventName,
      session_id: sessionId,
      content_id: contentId,
      dedupe_key: dedupeKey,
      properties
    })
  });
  if (!response.ok) throw new Error("event_write_failed");
}

export async function trackClientEvent(
  eventName: Exclude<ClientEventName, "session_started">,
  contentId: string,
  properties: Record<string, unknown> = {}
) {
  const sessionId = getSessionId();
  const sessionMarker = `vg-session-started:${sessionId}`;
  if (!sessionStorage.getItem(sessionMarker)) {
    sessionStorage.setItem(sessionMarker, "1");
    void postEvent("session_started", sessionId, null, `session_started:${sessionId}`, {})
      .catch(() => sessionStorage.removeItem(sessionMarker));
  }

  await postEvent(
    eventName,
    sessionId,
    contentId,
    `${eventName}:${contentId}:${sessionId}`,
    properties
  );
  return sessionId;
}

export function currentSessionId() {
  return getSessionId();
}
