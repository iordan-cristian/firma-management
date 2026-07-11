ALTER TABLE suchauftrag
    ADD COLUMN IF NOT EXISTS fachlicher_skill_ko_kriterium   BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS gehalt_ko_kriterium              BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS zertifikate_ko_kriterium         BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS deutsch_ko_kriterium             BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS englisch_ko_kriterium            BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS sonstige_sprachen_ko_kriterium   BOOLEAN NOT NULL DEFAULT FALSE;
