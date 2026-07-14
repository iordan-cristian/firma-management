-- ---------------------------------------------------------------------------
-- Table: verknuepfung
-- ---------------------------------------------------------------------------
CREATE TABLE verknuepfung (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suchauftrag_id  UUID REFERENCES suchauftrag(id) ON DELETE SET NULL,
    firma_id        UUID REFERENCES firma(id) ON DELETE SET NULL,
    kandidat_id     UUID REFERENCES kandidat(id) ON DELETE SET NULL
);

CREATE INDEX idx_verknuepfung_suchauftrag_id ON verknuepfung(suchauftrag_id);
CREATE INDEX idx_verknuepfung_firma_id       ON verknuepfung(firma_id);
CREATE INDEX idx_verknuepfung_kandidat_id    ON verknuepfung(kandidat_id);

COMMENT ON TABLE  verknuepfung                IS 'Links a Suchauftrag, Firma, and Kandidat together';
COMMENT ON COLUMN verknuepfung.suchauftrag_id IS 'FK → suchauftrag.id';
COMMENT ON COLUMN verknuepfung.firma_id       IS 'FK → firma.id';
COMMENT ON COLUMN verknuepfung.kandidat_id    IS 'FK → kandidat.id';
