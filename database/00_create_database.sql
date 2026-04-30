-- Run this once as a Postgres superuser (e.g. the `postgres` user)
-- BEFORE connecting to the new database. Standard psql cannot CREATE
-- DATABASE while inside a transaction or while connected to that DB,
-- so this file is meant to be executed against the default `postgres`
-- maintenance database.
--
--   psql -U postgres -d postgres -f 00_create_database.sql
--
-- Or, equivalently, from the shell:
--   createdb -U postgres firma_management

DROP DATABASE IF EXISTS firma_management;
CREATE DATABASE firma_management
    WITH ENCODING = 'UTF8'
         LC_COLLATE = 'C'
         LC_CTYPE = 'C'
         TEMPLATE = template0;

COMMENT ON DATABASE firma_management IS 'Firma Management application database';
