ALTER TABLE suchauftrag
    ADD COLUMN IF NOT EXISTS entfernung INTEGER;

COMMENT ON COLUMN suchauftrag.entfernung IS 'Entfernung in km';
