ALTER TABLE kandidat
    ADD COLUMN IF NOT EXISTS allgemeiner_schwerpunkt_ko_kriterium  BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS fachlicher_skill_ko_kriterium         BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS fachlicher_skill_mindestens_ein       BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS gehalt_ko_kriterium                   BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS berufserfahrung_ko_kriterium          BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS branchenkenntnisse_ko_kriterium       BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS branchenkenntnisse_mindestens_ein     BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS zertifikate_ko_kriterium              BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS zertifikate_mindestens_ein            BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS deutsch_ko_kriterium                  BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS englisch_ko_kriterium                 BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS sonstige_sprachen_ko_kriterium        BOOLEAN NOT NULL DEFAULT FALSE;
