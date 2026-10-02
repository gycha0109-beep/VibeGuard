# V2 Intake Checklist

Run only after the independent baseline source has been frozen.

## Repository / build

- identify framework and package manager;
- record dependency lock state;
- verify clean install and production build;
- inventory environment variables without exposing values.

## Authentication / authorization

- identify session source;
- find all role/privilege decisions;
- enumerate admin-only routes/actions;
- inspect profile update boundaries.

## Database / Supabase

- inventory tables, RLS enablement and policies;
- inventory grants and SECURITY DEFINER functions;
- map client-accessible insert/update/delete paths;
- inspect uniqueness and transactional invariants.

## Storage

- inventory buckets;
- identify path ownership convention;
- inspect cross-user read/write/delete policy.

## Voting / data integrity

- identify canonical vote path;
- test retry behavior;
- test duplicate requests;
- test concurrent same-user/same-poll requests;
- compare durable vote, aggregate and event counts.

## Analytics

- identify event write path;
- identify events used as business truth;
- attempt direct/canonical event forgery;
- inspect export authorization and CSV handling.

## Runtime / QA

- identify critical browser flow;
- run production build;
- run Chromium/WebKit/mobile-like browser regression where applicable;
- capture page and console errors;
- inspect health/readiness behavior if present.

## Rule

The checklist is a set of areas to inspect, **not a list of presumed defects**. An item becomes a finding only after evidence is obtained.
