ALTER TABLE kandidat
    ADD COLUMN IF NOT EXISTS prozess_beendet_am DATE;

-- Kandidaten whose process is already finished have no recorded date: use their anlage_datum.
-- Finished = one Verknüpfung fully paid, or at least one Verknüpfung and all of them Abgesagt.
UPDATE kandidat k
SET prozess_beendet_am = k.anlage_datum
WHERE EXISTS (SELECT 1 FROM verknuepfung v
              WHERE v.kandidat_id = k.id AND v.verknuepfung_status = 'PROZESS_RECHNUNG_VOLLSTAENDIG_BEZAHLT')
   OR (EXISTS (SELECT 1 FROM verknuepfung v WHERE v.kandidat_id = k.id)
       AND NOT EXISTS (SELECT 1 FROM verknuepfung v
                       WHERE v.kandidat_id = k.id
                         AND (v.verknuepfung_status IS NULL OR v.verknuepfung_status <> 'ABGESAGT')));
