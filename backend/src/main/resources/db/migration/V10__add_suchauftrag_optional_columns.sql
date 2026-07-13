ALTER TABLE suchauftrag
    ADD COLUMN IF NOT EXISTS optionale_fachliche_skills TEXT,
    ADD COLUMN IF NOT EXISTS optionale_zertifikate       TEXT;
