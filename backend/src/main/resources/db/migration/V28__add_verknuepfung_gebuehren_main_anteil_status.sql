ALTER TABLE verknuepfung
    ADD COLUMN IF NOT EXISTS gebuehren           NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS main_anteil         NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS verknuepfung_status VARCHAR(64);

ALTER TABLE verknuepfung
    ADD CONSTRAINT verknuepfung_verknuepfung_status_check
    CHECK (verknuepfung_status IS NULL OR verknuepfung_status IN (
        'SELBSTBEWORBEN',
        'NOGO',
        'VORGESTELLT',
        'ABGESAGT',
        'PROZESS_START',
        'PROZESS_LAUFEND',
        'PROZESS_BEIDERSEITIGE_ZUSAGE',
        'PROZESS_RECHNUNG_VOLLSTAENDIG_BEZAHLT'
    ));
