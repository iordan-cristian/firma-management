ALTER TABLE firma
    ADD COLUMN IF NOT EXISTS name                    TEXT,
    ADD COLUMN IF NOT EXISTS standort                TEXT,
    ADD COLUMN IF NOT EXISTS allgemeiner_schwerpunkt VARCHAR(32),
    ADD COLUMN IF NOT EXISTS email                   TEXT,
    ADD COLUMN IF NOT EXISTS telefon                 TEXT,
    ADD COLUMN IF NOT EXISTS mobil                   TEXT,
    ADD COLUMN IF NOT EXISTS angebot_website         TEXT;

ALTER TABLE ansprechpartner
    ADD COLUMN IF NOT EXISTS vorname         TEXT,
    ADD COLUMN IF NOT EXISTS nachname        TEXT,
    ADD COLUMN IF NOT EXISTS schwerpunkt     TEXT,
    ADD COLUMN IF NOT EXISTS position        TEXT,
    ADD COLUMN IF NOT EXISTS telefonnummer   TEXT,
    ADD COLUMN IF NOT EXISTS email           TEXT,
    ADD COLUMN IF NOT EXISTS kontaktinterval TEXT,
    ADD COLUMN IF NOT EXISTS informationen   TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_profil TEXT,
    ADD COLUMN IF NOT EXISTS xing_profil     TEXT;
