ALTER TABLE suchauftrag
    ADD COLUMN IF NOT EXISTS fachlicher_skill_mindestens_ein     BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS branchenkenntnisse_mindestens_ein   BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS zertifikate_mindestens_ein          BOOLEAN NOT NULL DEFAULT FALSE;
