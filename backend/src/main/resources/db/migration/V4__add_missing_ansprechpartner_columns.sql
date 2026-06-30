ALTER TABLE ansprechpartner
    ADD COLUMN IF NOT EXISTS linkedin_profil TEXT,
    ADD COLUMN IF NOT EXISTS xing_profil     TEXT;
