# Event Taxonomy

| Event | Required context | Canonical writer | Dedupe rule |
|---|---|---|---|
| session_started | session_id | client event API | stable dedupe_key per session |
| content_viewed | session_id, content_id | client event API | stable view token |
| edit_started | session_id, content_id | client event API | stable per edit session |
| edit_completed | session_id, content_id | client event API | stable per completion |
| vote_started | session_id, content_id | client event API | stable per attempt |
| vote_submitted | session_id, content_id, user_id | DB vote RPC | only when a new vote row is inserted |
| result_viewed | session_id, content_id | client event API | stable view token |
| share_clicked | session_id, content_id | client event API | stable click token |

Common fields: `event_name`, `user_id nullable`, `session_id`, `content_id nullable`, `occurred_at`, `properties jsonb`, `source`, `version`, `dedupe_key`.

## Retry / duplicate policy
Client observational events send a stable `dedupe_key`; the database has a partial unique index over non-null keys. A duplicate network retry is accepted as already-observed rather than creating a second logical event. `vote_submitted` is canonical: it is written by the same database RPC that creates the unique vote and increments the aggregate, and only when the vote insert wins.

## Funnel
`admin_funnel(from,to)` returns ordered stages with distinct-session counts, conversion from the prior stage, and drop-off percentage. The RPC is admin-gated.

## Export
`admin_export_events()` is admin-gated. `/api/admin/events/export` converts the authorized result to deterministic CSV and sets `no-store`.
