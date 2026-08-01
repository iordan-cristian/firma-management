ALTER TABLE suchauftrag
    ALTER COLUMN berufserfahrung TYPE INTEGER USING (
        CASE WHEN berufserfahrung ~ '^\s*\d+' THEN (substring(berufserfahrung from '\d+'))::integer ELSE NULL END
    );

ALTER TABLE kandidat
    ALTER COLUMN berufserfahrung TYPE INTEGER USING (
        CASE WHEN berufserfahrung ~ '^\s*\d+' THEN (substring(berufserfahrung from '\d+'))::integer ELSE NULL END
    );
