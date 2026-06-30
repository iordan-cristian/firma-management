ALTER TABLE suchauftrag
    ADD COLUMN IF NOT EXISTS ort                TEXT,
    ADD COLUMN IF NOT EXISTS postleitzahl       TEXT,
    ADD COLUMN IF NOT EXISTS adresse            TEXT,
    ADD COLUMN IF NOT EXISTS fachlicher_skill   TEXT,
    ADD COLUMN IF NOT EXISTS gehalt_mehr_info   TEXT,
    ADD COLUMN IF NOT EXISTS berufserfahrung    TEXT,
    ADD COLUMN IF NOT EXISTS branchenkenntnisse TEXT,
    ADD COLUMN IF NOT EXISTS zertifikate        TEXT,
    ADD COLUMN IF NOT EXISTS deutsch            VARCHAR(16),
    ADD COLUMN IF NOT EXISTS englisch           VARCHAR(16),
    ADD COLUMN IF NOT EXISTS sonstige_sprachen  TEXT,
    ADD COLUMN IF NOT EXISTS informationen      TEXT,
    ADD COLUMN IF NOT EXISTS anlage_datum       DATE;
