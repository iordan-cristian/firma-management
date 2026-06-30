ALTER TABLE kandidat_dokument ALTER COLUMN dokument_typ DROP NOT NULL;

ALTER TABLE kandidat_dokument DROP CONSTRAINT IF EXISTS kandidat_dokument_dokument_typ_check;
ALTER TABLE kandidat_dokument
    ADD CONSTRAINT kandidat_dokument_dokument_typ_check
        CHECK (dokument_typ IS NULL OR dokument_typ IN ('CV', 'DSGVO', 'INTERVIEW'));