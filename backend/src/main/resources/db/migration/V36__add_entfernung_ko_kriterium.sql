-- KO-Kriterium "Entfernung": maximum straight-line distance (km) between the PLZ of Suchauftrag and Kandidat
ALTER TABLE suchauftrag
    ADD COLUMN IF NOT EXISTS entfernung_ko_kriterium BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE kandidat
    ADD COLUMN IF NOT EXISTS entfernung INTEGER,
    ADD COLUMN IF NOT EXISTS entfernung_ko_kriterium BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN kandidat.entfernung IS 'Entfernung in km';
