# Event Taxonomy (target contract)

| Event | Required context | Notes |
|---|---|---|
| session_started | session_id | anonymous allowed |
| content_viewed | session_id, content_id | one logical view event per view token |
| edit_started | session_id, content_id | user optional |
| edit_completed | session_id, content_id | properties may contain non-sensitive edit metadata |
| vote_started | session_id, content_id | transient funnel event |
| vote_submitted | session_id, content_id, user_id | server writes canonical success event |
| result_viewed | session_id, content_id | result funnel |
| share_clicked | session_id, content_id | channel in properties allowlist |

Target common fields: `event_name`, `user_id nullable`, `session_id`, `content_id nullable`, `occurred_at`, `properties jsonb`, `source`, `version`, `dedupe_key`.

Target retry rule: client-generated observational events use a stable `dedupe_key`; canonical transaction events such as `vote_submitted` are emitted inside/after the successful server transaction and must not be duplicated by network retry.
