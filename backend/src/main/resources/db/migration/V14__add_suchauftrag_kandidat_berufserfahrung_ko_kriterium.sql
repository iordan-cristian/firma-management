ALTER TABLE suchauftrag
    ADD COLUMN IF NOT EXISTS berufserfahrung_ko_kriterium     BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS branchenkenntnisse_ko_kriterium  BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS optionale_branchenkenntnisse     TEXT;

ALTER TABLE kandidat
    ADD COLUMN IF NOT EXISTS berufserfahrung TEXT;
