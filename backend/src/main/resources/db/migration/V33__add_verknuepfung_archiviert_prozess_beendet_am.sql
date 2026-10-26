ALTER TABLE verknuepfung_archiviert
    ADD COLUMN IF NOT EXISTS prozess_beendet_am DATE;

COMMENT ON COLUMN verknuepfung_archiviert.prozess_beendet_am IS 'kandidat.prozess_beendet_am before "Reaktivieren" (used to revert it)';
