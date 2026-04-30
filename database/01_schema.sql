-- Schema for the firma_management database.
-- Connect to the firma_management database before running this file:
--   psql -U postgres -d firma_management -f 01_schema.sql
--
-- This script is idempotent (uses IF NOT EXISTS) so it is safe to re-run.
-- Column names use snake_case; this matches the Hibernate physical naming
-- strategy used by the Spring Boot backend.

-- gen_random_uuid() is built into Postgres 13+. For older versions, enable pgcrypto:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ---------------------------------------------------------------------------
-- Table: firma
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS firma (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kontaktdaten             TEXT,
    standort                 TEXT,
    allgemeiner_schwerpunkt  TEXT
);

COMMENT ON TABLE  firma                          IS 'Companies tracked in the system';
COMMENT ON COLUMN firma.kontaktdaten             IS 'Free-text contact details';
COMMENT ON COLUMN firma.standort                 IS 'Location';
COMMENT ON COLUMN firma.allgemeiner_schwerpunkt  IS 'General focus / industry';


-- ---------------------------------------------------------------------------
-- Table: ansprechpartner
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ansprechpartner (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firma_id         UUID NOT NULL REFERENCES firma(id) ON DELETE CASCADE,
    vorname          TEXT,
    nachname         TEXT,
    schwerpunkt      TEXT,
    position         TEXT,
    telefonnummer    TEXT,
    email            TEXT,
    kontaktinterval  TEXT,
    informationen    TEXT
);

CREATE INDEX IF NOT EXISTS idx_ansprechpartner_firma_id ON ansprechpartner(firma_id);

COMMENT ON TABLE  ansprechpartner                IS 'Contact persons attached to a Firma';
COMMENT ON COLUMN ansprechpartner.firma_id       IS 'FK to firma.id';
COMMENT ON COLUMN ansprechpartner.telefonnummer  IS 'Phone number (basic format validated by the API)';
COMMENT ON COLUMN ansprechpartner.email          IS 'E-mail address (basic format validated by the API)';
COMMENT ON COLUMN ansprechpartner.informationen  IS 'Free-form notes; can be very long';


-- ---------------------------------------------------------------------------
-- Table: suchauftrag
-- ---------------------------------------------------------------------------
-- kernbereich and status are stored as the Java enum NAME (uppercase),
-- because the JPA mapping uses @Enumerated(EnumType.STRING).
-- The frontend sends/receives the labels (e.g. "in Arbeit") and the
-- backend converts them.
CREATE TABLE IF NOT EXISTS suchauftrag (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ansprechpartner_id   UUID NOT NULL REFERENCES ansprechpartner(id) ON DELETE CASCADE,
    kernbereich          VARCHAR(32) NOT NULL
        CHECK (kernbereich IN ('INVESTOREN', 'VERTRIEB', 'IMOBILIEN', 'PERSONAL')),
    auftrag_placeholder  TEXT,
    status               VARCHAR(32) NOT NULL
        CHECK (status IN ('IN_ARBEIT', 'FERTIG'))
);

CREATE INDEX IF NOT EXISTS idx_suchauftrag_ansprechpartner_id ON suchauftrag(ansprechpartner_id);
CREATE INDEX IF NOT EXISTS idx_suchauftrag_status             ON suchauftrag(status);

COMMENT ON TABLE  suchauftrag                     IS 'Search assignments tied to an Ansprechpartner';
COMMENT ON COLUMN suchauftrag.ansprechpartner_id  IS 'FK to ansprechpartner.id';
COMMENT ON COLUMN suchauftrag.kernbereich         IS 'Enum: INVESTOREN | VERTRIEB | IMOBILIEN | PERSONAL';
COMMENT ON COLUMN suchauftrag.status              IS 'Enum: IN_ARBEIT | FERTIG';


-- ---------------------------------------------------------------------------
-- Table: vertrag
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vertrag (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ansprechpartner_id  UUID NOT NULL REFERENCES ansprechpartner(id) ON DELETE CASCADE,
    firma_id            UUID NOT NULL REFERENCES firma(id) ON DELETE CASCADE,
    suchauftrag_id      UUID REFERENCES suchauftrag(id) ON DELETE SET NULL,
    wert                NUMERIC(19, 2),
    bezahlbar_am        DATE,
    bezahlt             BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_vertrag_firma_id            ON vertrag(firma_id);
CREATE INDEX IF NOT EXISTS idx_vertrag_ansprechpartner_id  ON vertrag(ansprechpartner_id);
CREATE INDEX IF NOT EXISTS idx_vertrag_suchauftrag_id      ON vertrag(suchauftrag_id);
CREATE INDEX IF NOT EXISTS idx_vertrag_bezahlbar_am        ON vertrag(bezahlbar_am);

COMMENT ON TABLE  vertrag                IS 'Contracts referencing a Firma, Ansprechpartner, and (optionally) a Suchauftrag';
COMMENT ON COLUMN vertrag.wert           IS 'Decimal monetary amount';
COMMENT ON COLUMN vertrag.bezahlbar_am   IS 'Due date (stored as DATE; the API serializes as dd/MM/yyyy)';
COMMENT ON COLUMN vertrag.bezahlt        IS 'Whether the contract has been paid';


-- ---------------------------------------------------------------------------
-- Table: app_user
-- ---------------------------------------------------------------------------
-- The admin user is seeded automatically by the Spring Boot DataInitializer
-- on first startup, so no INSERT is required here.
CREATE TABLE IF NOT EXISTS app_user (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username  VARCHAR(255) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    role      VARCHAR(64)  NOT NULL
);

COMMENT ON TABLE  app_user           IS 'Application users with BCrypt-hashed passwords';
COMMENT ON COLUMN app_user.password  IS 'BCrypt hash, never plaintext';
COMMENT ON COLUMN app_user.role      IS 'Role name without the ROLE_ prefix (e.g. ADMIN)';
