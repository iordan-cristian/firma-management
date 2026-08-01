UPDATE kandidat
SET allgemeiner_schwerpunkt = 'TECHNIK'
WHERE allgemeiner_schwerpunkt IN ('GEBAEUDETECHNIK', 'ENERGIETECHNIK', 'MASCHINENBAU');

ALTER TABLE kandidat DROP CONSTRAINT IF EXISTS kandidat_allgemeiner_schwerpunkt_check;

ALTER TABLE kandidat
    ADD CONSTRAINT kandidat_allgemeiner_schwerpunkt_check
        CHECK (allgemeiner_schwerpunkt IN ('TECHNIK', 'INFORMATIK', 'KAUFMAENNISCH'));
