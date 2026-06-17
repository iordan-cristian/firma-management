CREATE TABLE kandidat_dokument (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    kandidat_id    UUID        NOT NULL REFERENCES kandidat(id) ON DELETE CASCADE,
    dokument_typ   VARCHAR(16) NOT NULL CHECK (dokument_typ IN ('CV', 'DSGVO', 'INTERVIEW')),
    dateiname      TEXT        NOT NULL,
    objekt_key     TEXT        NOT NULL,
    mime_type      TEXT        NOT NULL,
    dateigroesse   BIGINT      NOT NULL,
    hochgeladen_am TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kandidat_dokument_kandidat_id ON kandidat_dokument(kandidat_id);
