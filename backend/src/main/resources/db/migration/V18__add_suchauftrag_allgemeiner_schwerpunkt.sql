ALTER TABLE suchauftrag
    ADD COLUMN IF NOT EXISTS allgemeiner_schwerpunkt VARCHAR(32)
        CHECK (allgemeiner_schwerpunkt IN ('TECHNIK', 'INFORMATIK', 'KAUFMAENNISCH'));
