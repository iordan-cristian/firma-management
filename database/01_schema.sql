-- Schema for the firma_management database.
-- Connect to the firma_management database before running this file:
--   psql -U postgres -d firma_management -f 01_schema.sql
--
-- This script drops and recreates all tables so it always reflects the
-- current state. Run it on a fresh database or to reset an existing one.
-- WARNING: all data will be lost when re-run against an existing database.
--
-- Column names use snake_case; this matches the Hibernate physical naming
-- strategy used by the Spring Boot backend (ddl-auto: update will keep the
-- tables in sync for additive changes, but this script is the source of truth).
--
-- Enum columns store the Java enum NAME (uppercase), e.g. 'MAENNLICH'.
-- The frontend sends/receives human-readable labels (e.g. 'männlich') and
-- the backend converts them via @JsonCreator / @JsonValue.

-- gen_random_uuid() is built into Postgres 13+.


-- ---------------------------------------------------------------------------
-- Drop all tables (reverse FK order)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS vertrag        CASCADE;
DROP TABLE IF EXISTS suchauftrag    CASCADE;
DROP TABLE IF EXISTS ansprechpartner CASCADE;
DROP TABLE IF EXISTS kandidat       CASCADE;
DROP TABLE IF EXISTS firma          CASCADE;
DROP TABLE IF EXISTS app_user       CASCADE;


-- ---------------------------------------------------------------------------
-- Table: firma
-- ---------------------------------------------------------------------------
CREATE TABLE firma (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                     TEXT,
    standort                 TEXT,
    allgemeiner_schwerpunkt  VARCHAR(32)
        CHECK (allgemeiner_schwerpunkt IN ('GEBAEUDETECHNIK', 'ENERGIETECHNIK', 'MASCHINENBAU', 'INFORMATIK', 'KAUFMAENNISCH')),
    email                    TEXT,
    telefon                  TEXT,
    mobil                    TEXT
);

COMMENT ON TABLE  firma                         IS 'Companies tracked in the system';
COMMENT ON COLUMN firma.standort                IS 'Location';
COMMENT ON COLUMN firma.allgemeiner_schwerpunkt IS 'General focus / industry';
COMMENT ON COLUMN firma.email                   IS 'Company e-mail address (validated by the API)';
COMMENT ON COLUMN firma.telefon                 IS 'Company phone number (validated by the API)';
COMMENT ON COLUMN firma.mobil                   IS 'Company mobile phone number (validated by the API)';


-- ---------------------------------------------------------------------------
-- Table: ansprechpartner
-- ---------------------------------------------------------------------------
CREATE TABLE ansprechpartner (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firma_id         UUID NOT NULL REFERENCES firma(id) ON DELETE CASCADE,
    vorname          TEXT,
    nachname         TEXT,
    schwerpunkt      TEXT,
    position         TEXT,
    telefonnummer    TEXT,
    email            TEXT,
    kontaktinterval      TEXT,
    informationen        TEXT,
    social_media_profil  TEXT
);

CREATE INDEX idx_ansprechpartner_firma_id ON ansprechpartner(firma_id);

COMMENT ON TABLE  ansprechpartner               IS 'Contact persons attached to a Firma';
COMMENT ON COLUMN ansprechpartner.firma_id      IS 'FK → firma.id';
COMMENT ON COLUMN ansprechpartner.telefonnummer IS 'Phone number (basic format validated by the API)';
COMMENT ON COLUMN ansprechpartner.email         IS 'E-mail address (basic format validated by the API)';
COMMENT ON COLUMN ansprechpartner.informationen IS 'Free-form notes';


-- ---------------------------------------------------------------------------
-- Table: suchauftrag
-- ---------------------------------------------------------------------------
-- aktivitaet and status are stored as the Java enum NAME (uppercase).
-- The frontend sends/receives labels (e.g. "in Arbeit") and the
-- backend converts them.
CREATE TABLE suchauftrag (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ansprechpartner_id   UUID NOT NULL REFERENCES ansprechpartner(id) ON DELETE CASCADE,
    aktivitaet           VARCHAR(32) NOT NULL
        CHECK (aktivitaet IN ('INVESTOREN', 'VERTRIEB', 'IMOBILIEN', 'PERSONAL')),
    ort                  TEXT,
    fachlicher_skill     TEXT,
    gehalt               TEXT,
    berufserfahrung      TEXT,
    branchenkenntnisse   TEXT,
    zertifikate          TEXT,
    status               VARCHAR(32) NOT NULL
        CHECK (status IN ('IN_ARBEIT', 'FERTIG')),
    anlage_datum         DATE
);

CREATE INDEX idx_suchauftrag_ansprechpartner_id ON suchauftrag(ansprechpartner_id);
CREATE INDEX idx_suchauftrag_status             ON suchauftrag(status);

COMMENT ON TABLE  suchauftrag                    IS 'Search assignments tied to an Ansprechpartner';
COMMENT ON COLUMN suchauftrag.ansprechpartner_id IS 'FK → ansprechpartner.id';
COMMENT ON COLUMN suchauftrag.aktivitaet         IS 'Enum: INVESTOREN | VERTRIEB | IMOBILIEN | PERSONAL';
COMMENT ON COLUMN suchauftrag.status             IS 'Enum: IN_ARBEIT | FERTIG';


-- ---------------------------------------------------------------------------
-- Table: vertrag
-- ---------------------------------------------------------------------------
CREATE TABLE vertrag (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ansprechpartner_id  UUID NOT NULL REFERENCES ansprechpartner(id) ON DELETE CASCADE,
    firma_id            UUID NOT NULL REFERENCES firma(id) ON DELETE CASCADE,
    suchauftrag_id      UUID REFERENCES suchauftrag(id) ON DELETE SET NULL,
    wert                NUMERIC(19, 2),
    bezahlbar_am        DATE,
    bezahlt             BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_vertrag_firma_id           ON vertrag(firma_id);
CREATE INDEX idx_vertrag_ansprechpartner_id ON vertrag(ansprechpartner_id);
CREATE INDEX idx_vertrag_suchauftrag_id     ON vertrag(suchauftrag_id);
CREATE INDEX idx_vertrag_bezahlbar_am       ON vertrag(bezahlbar_am);

COMMENT ON TABLE  vertrag              IS 'Contracts referencing a Firma, Ansprechpartner, and optionally a Suchauftrag';
COMMENT ON COLUMN vertrag.wert         IS 'Decimal monetary amount';
COMMENT ON COLUMN vertrag.bezahlbar_am IS 'Due date (stored as DATE; the API serialises as dd/MM/yyyy)';
COMMENT ON COLUMN vertrag.bezahlt      IS 'Whether the contract has been paid';


-- ---------------------------------------------------------------------------
-- Table: app_user
-- ---------------------------------------------------------------------------
-- The admin user is seeded automatically by the Spring Boot DataInitializer
-- on first startup, so no INSERT is needed here.
CREATE TABLE app_user (
    id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username  VARCHAR(255) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    role      VARCHAR(64)  NOT NULL
);

COMMENT ON TABLE  app_user          IS 'Application users with BCrypt-hashed passwords';
COMMENT ON COLUMN app_user.password IS 'BCrypt hash, never plaintext';
COMMENT ON COLUMN app_user.role     IS 'Role name without the ROLE_ prefix (e.g. ADMIN)';


-- ---------------------------------------------------------------------------
-- Table: kandidat
-- ---------------------------------------------------------------------------
CREATE TABLE kandidat (
    id                                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- DSGVO
    dsgvo_bestaetigungs_datum            DATE,

    -- Persönliche Daten
    geschlecht                           VARCHAR(32)
        CHECK (geschlecht IN ('MAENNLICH', 'WEIBLICH', 'DIVERS', 'BEVORZUGE_NICHT_ZU_SAGEN')),
    titel                                VARCHAR(16)
        CHECK (titel IN ('DR', 'ING')),
    vorname                              TEXT,
    nachname                             TEXT,
    postleitzahl                         INTEGER,
    ort                                  TEXT,
    geburtsjahr                          INTEGER CHECK (geburtsjahr BETWEEN 1000 AND 9999),
    staatsangehoerigkeit                 TEXT,
    familienstand                        TEXT,
    kinder                               TEXT,

    -- Berufliche Anforderungen
    wochenstunden                        TEXT,
    gehaltsrange                         TEXT,
    wochenendbereitschaft                TEXT,
    homeoffice                           TEXT,
    firmenwagenregelung                  TEXT,
    reisetaetigkeiten_mit_uebernachtung  TEXT,
    taegliche_fahrzeit                   INTEGER,

    -- Sprachkenntnisse
    deutsch                              VARCHAR(16)
        CHECK (deutsch  IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'MUTTERSPRACHE')),
    englisch                             VARCHAR(16)
        CHECK (englisch IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'MUTTERSPRACHE')),
    sonstige_sprachen                    TEXT,

    -- Qualifikationen
    hochschulabschluss                   TEXT,
    berufsausbildung                     TEXT,
    autofuehrerschein                    VARCHAR(16)
        CHECK (autofuehrerschein IN ('VORHANDEN', 'NICHT_VORHANDEN')),
    zertifikate                          TEXT,

    -- Berufserfahrung
    branchenkenntnisse                   TEXT,
    aktuelle_taetigkeiten                TEXT,
    aktuelle_position                    TEXT,

    -- Wechsel & Zukunft
    wechselgruende                       TEXT,
    zukuenftige_position_taetigkeiten    TEXT,
    kuendigungsfrist                     TEXT,
    erstes_online_meeting                TEXT,
    firmen_selbevorben                   TEXT,
    firmen_nogo                          TEXT,

    allgemeiner_schwerpunkt              VARCHAR(32)
        CHECK (allgemeiner_schwerpunkt IN ('GEBAEUDETECHNIK', 'ENERGIETECHNIK', 'MASCHINENBAU', 'INFORMATIK', 'KAUFMAENNISCH')),

    fachlicher_skill                     TEXT
);

CREATE INDEX idx_kandidat_nachname ON kandidat(nachname);

COMMENT ON TABLE  kandidat                               IS 'Job candidates managed in the system';
COMMENT ON COLUMN kandidat.geschlecht                    IS 'Enum: MAENNLICH | WEIBLICH | DIVERS | BEVORZUGE_NICHT_ZU_SAGEN';
COMMENT ON COLUMN kandidat.titel                         IS 'Enum: DR | ING';
COMMENT ON COLUMN kandidat.wochenstunden                 IS 'Text; single value or range, e.g. 40 or 30-40';
COMMENT ON COLUMN kandidat.gehaltsrange                  IS 'Text; single value or range, e.g. 60000 or 55000-70000';
COMMENT ON COLUMN kandidat.deutsch                       IS 'Enum: A1 | A2 | B1 | B2 | C1 | C2 | MUTTERSPRACHE';
COMMENT ON COLUMN kandidat.englisch                      IS 'Enum: A1 | A2 | B1 | B2 | C1 | C2 | MUTTERSPRACHE';
COMMENT ON COLUMN kandidat.autofuehrerschein             IS 'Enum: VORHANDEN | NICHT_VORHANDEN';
COMMENT ON COLUMN kandidat.taegliche_fahrzeit            IS 'Daily commute time in minutes';