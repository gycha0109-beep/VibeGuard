#!/usr/bin/env bash
set -euo pipefail

DB_CONTAINER="$(docker ps --filter 'name=supabase_db_' --format '{{.Names}}' | head -n 1)"
if [[ -z "$DB_CONTAINER" ]]; then
  echo "Supabase DB container not found" >&2
  exit 1
fi

run_psql() {
  docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -X -v ON_ERROR_STOP=1 "$@"
}

echo "[v2-retest] apply remediated schema"
run_psql < db/schema.sql

echo "[v2-retest] rerun original attack paths and invariant checks"
run_psql < audit-v2/retest.sql
