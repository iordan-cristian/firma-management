ALTER TABLE verknuepfung
    ADD COLUMN IF NOT EXISTS gebuehren           NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS main_anteil         NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS verknuepfung_status TEXT;
