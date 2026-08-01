ALTER TABLE suchauftrag
    ALTER COLUMN allgemeiner_schwerpunkt_ko_kriterium SET DEFAULT TRUE;

UPDATE suchauftrag SET allgemeiner_schwerpunkt_ko_kriterium = TRUE;
