-- ---------------------------------------------------------------------------
-- "Prozess beendet am" is no longer stored on the Kandidat: it is derived from
-- the date of the last status change of its Verknüpfungen.
-- ---------------------------------------------------------------------------
ALTER TABLE verknuepfung
    ADD COLUMN IF NOT EXISTS status_geaendert_am DATE;
ALTER TABLE verknuepfung_archiviert
    ADD COLUMN IF NOT EXISTS status_geaendert_am DATE;

COMMENT ON COLUMN verknuepfung.status_geaendert_am            IS 'Date of the last change of verknuepfung_status';
COMMENT ON COLUMN verknuepfung_archiviert.status_geaendert_am IS 'Date of the last change of verknuepfung_status';

-- Finished processes keep the month they are shown in today
UPDATE verknuepfung v
SET status_geaendert_am = k.prozess_beendet_am
FROM kandidat k
WHERE k.id = v.kandidat_id
  AND k.prozess_beendet_am IS NOT NULL;

-- Archived rounds were finished processes: use the date stored by "Reaktivieren",
-- for rows archived before V33 the Anlagedatum (like V31)
UPDATE verknuepfung_archiviert a
SET status_geaendert_am = COALESCE(a.prozess_beendet_am, k.anlage_datum)
FROM kandidat k
WHERE k.id = a.kandidat_id;

ALTER TABLE verknuepfung_archiviert DROP COLUMN IF EXISTS prozess_beendet_am;
ALTER TABLE kandidat DROP COLUMN IF EXISTS prozess_beendet_am;
