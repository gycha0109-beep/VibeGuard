# Event Taxonomy

| Event | Required context | Canonical writer | Dedupe |
|---|---|---|---|
| session_started | session_id | `record_event` | stable session key |
| content_viewed | session_id, content_id | `record_event` | stable session/content key |
| edit_started | session_id, content_id | `record_event` | stable edit-session key |
| edit_completed | session_id, content_id | `record_event` | stable completion key |
| vote_started | session_id, content_id | `record_event` | stable poll/session key |
| vote_submitted | session_id, content_id, user_id | **`submit_vote` only** | tied to unique vote insert |
| result_viewed | session_id, content_id | `record_event` | stable result/session key |
| share_clicked | session_id, content_id | `record_event` | stable click/session key |

Common fields: `event_name`, `user_id nullable`, `session_id`, `content_id nullable`, `occurred_at`, `properties jsonb`, `source`, `version`, `dedupe_key`.

## Write boundary

`anon` and `authenticated` roles cannot INSERT/UPDATE/DELETE `user_events` directly. Client observational events execute `record_event`, which:

- allowlists event names and excludes canonical `vote_submitted`,
- derives `user_id` from `auth.uid()` rather than request payload,
- bounds session/dedupe lengths and properties payload size,
- validates content visibility/ownership,
- inserts with the stable dedupe key.

`vote_submitted` is emitted only inside `submit_vote` after a new unique vote wins. Network retries therefore cannot manufacture extra canonical vote events.

## Funnel

`admin_funnel(from,to)` counts sessions that reach stages in order and returns conversion/drop-off from the prior stage. Live SQL fixtures verify a `2 → 2 → 1 → 1 → 1 → 1` sequence and the expected 50% stage-3 conversion/drop-off.

## Export

`admin_export_events()` is admin-gated and orders by `occurred_at DESC, id DESC` for deterministic ties. `/api/admin/events/export` applies fixed column ordering, CSV quote escaping, `no-store` and neutralizes spreadsheet formula prefixes.
