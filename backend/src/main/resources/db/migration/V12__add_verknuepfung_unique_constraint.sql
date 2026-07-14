-- ---------------------------------------------------------------------------
-- Table: verknuepfung — prevent duplicate suchauftrag/kandidat links
-- ---------------------------------------------------------------------------
ALTER TABLE verknuepfung
    ADD CONSTRAINT uq_verknuepfung_suchauftrag_kandidat UNIQUE (suchauftrag_id, kandidat_id);
