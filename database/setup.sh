#!/usr/bin/env bash
# Convenience runner: creates the firma_management database, then loads
# the schema and the seed data. Requires `psql` on PATH.
#
# Usage:   ./setup.sh
# Env:     PGUSER (default: postgres), PGPASSWORD, PGHOST (default: localhost), PGPORT (default: 5432)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PG_USER="${PGUSER:-postgres}"
PG_HOST="${PGHOST:-localhost}"
PG_PORT="${PGPORT:-5432}"

echo "==> Creating database firma_management"
psql -U "$PG_USER" -h "$PG_HOST" -p "$PG_PORT" -d postgres -f "$SCRIPT_DIR/00_create_database.sql"

echo "==> Applying schema"
psql -U "$PG_USER" -h "$PG_HOST" -p "$PG_PORT" -d firma_management -f "$SCRIPT_DIR/01_schema.sql"

#echo "==> Seeding sample data"
#psql -U "$PG_USER" -h "$PG_HOST" -p "$PG_PORT" -d firma_management -f "$SCRIPT_DIR/02_seed.sql"

echo "==> Done."
