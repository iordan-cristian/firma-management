-- Drop everything created by 01_schema.sql.
-- Connect to the firma_management database before running:
--   psql -U postgres -d firma_management -f 99_drop.sql
--
-- WARNING: this destroys all data. Tables are dropped in dependency order
-- (children before parents).

BEGIN;

DROP TABLE IF EXISTS vertrag         CASCADE;
DROP TABLE IF EXISTS suchauftrag     CASCADE;
DROP TABLE IF EXISTS ansprechpartner CASCADE;
DROP TABLE IF EXISTS firma           CASCADE;
DROP TABLE IF EXISTS app_user        CASCADE;

COMMIT;
