-- firma
ALTER TABLE firma
    ADD COLUMN IF NOT EXISTS angebot_website TEXT;

-- ansprechpartner (already in V4, kept here as safety net)
ALTER TABLE ansprechpartner
    ADD COLUMN IF NOT EXISTS linkedin_profil TEXT,
    ADD COLUMN IF NOT EXISTS xing_profil     TEXT;

-- kandidat
ALTER TABLE kandidat
    ADD COLUMN IF NOT EXISTS taegliche_fahrzeit                  INTEGER,
    ADD COLUMN IF NOT EXISTS firmen_selbevorben                  TEXT,
    ADD COLUMN IF NOT EXISTS firmen_nogo                         TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_profil                     TEXT,
    ADD COLUMN IF NOT EXISTS xing_profil                         TEXT,
    ADD COLUMN IF NOT EXISTS gehalt_minimum                      NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS gehalt_maximum                      NUMERIC(10, 2);

-- suchauftrag
ALTER TABLE suchauftrag
    ADD COLUMN IF NOT EXISTS gehalt_minimum  NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS gehalt_maximum  NUMERIC(10, 2);
