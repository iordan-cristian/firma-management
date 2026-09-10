ALTER TABLE kandidat
    ADD COLUMN IF NOT EXISTS anlage_datum DATE;

UPDATE kandidat
   SET anlage_datum = CURRENT_DATE
 WHERE anlage_datum IS NULL;
