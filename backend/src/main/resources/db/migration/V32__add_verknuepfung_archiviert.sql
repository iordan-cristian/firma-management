-- ---------------------------------------------------------------------------
-- Table: verknuepfung_archiviert — Verknüpfungen moved here by "Reaktivieren"
-- ---------------------------------------------------------------------------
CREATE TABLE verknuepfung_archiviert (
    id                            UUID PRIMARY KEY,
    suchauftrag_id                UUID REFERENCES suchauftrag(id) ON DELETE SET NULL,
    firma_id                      UUID REFERENCES firma(id) ON DELETE SET NULL,
    kandidat_id                   UUID REFERENCES kandidat(id) ON DELETE SET NULL,
    gebuehren                     NUMERIC(10, 2),
    main_anteil                   NUMERIC(10, 2),
    verknuepfung_status           VARCHAR(64),
    verknuepfung_status_kommentar TEXT,
    archiviert_am                 DATE NOT NULL
);

CREATE INDEX idx_verknuepfung_archiviert_kandidat_id ON verknuepfung_archiviert(kandidat_id);

COMMENT ON TABLE  verknuepfung_archiviert               IS 'Archived Verknüpfungen of a reactivated Kandidat (same id as the former verknuepfung row)';
COMMENT ON COLUMN verknuepfung_archiviert.archiviert_am IS 'Date the Kandidat was reactivated';
