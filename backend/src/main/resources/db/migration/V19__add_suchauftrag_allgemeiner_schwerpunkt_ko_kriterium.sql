ALTER TABLE suchauftrag
    ADD COLUMN IF NOT EXISTS allgemeiner_schwerpunkt_ko_kriterium BOOLEAN NOT NULL DEFAULT FALSE;
