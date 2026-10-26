-- ---------------------------------------------------------------------------
-- Revert "Reaktivieren" for one Kandidat (for testing only)
-- ---------------------------------------------------------------------------
-- What it does:
--   "Reaktivieren" (Kandidaten (Perm) Bestand, right-click on a Kandidat from a
--   past month) moves all Verknüpfungen of the Kandidat to verknuepfung_archiviert.
--   This script undoes the latest "Reaktivieren" of the given Kandidat:
--     1. moves the archived Verknüpfungen of the latest round (newest
--        archiviert_am) back to verknuepfung, with their original ids and
--        status_geaendert_am,
--     2. deletes them from verknuepfung_archiviert.
--   The Bestand derives the month from the Verknüpfungen (last status change of
--   a finished process), so the Kandidat shows up in its old month again.
--   Earlier rounds (if the Kandidat was reactivated several times) stay archived;
--   run the script again to revert the next one.
--
-- Safety:
--   Aborts without changes if migration V34 is missing, the Kandidat has no
--   archived Verknüpfungen or already has current Verknüpfungen (created after
--   "Reaktivieren") — delete those first. Everything runs in one transaction.
--
-- Usage (psql): identify the Kandidat by e-mail OR by id
--   psql -U postgres -d firma_management -v email=max@example.com -f database_helper/revert_reaktivieren.sql
--   psql -U postgres -d firma_management -v kandidat_id=<uuid>     -f database_helper/revert_reaktivieren.sql
--
--   The e-mail is compared case-insensitively and must match exactly one
--   Kandidat; otherwise the script aborts (then use kandidat_id). If both are
--   given, the e-mail wins.
--
--   With docker compose:
--   docker compose exec -T db psql -U postgres -d firma_management \
--       -v email=max@example.com -f - < database_helper/revert_reaktivieren.sql
--
--   Find the id, e.g.:
--   SELECT id, vorname, nachname, email FROM kandidat WHERE nachname = 'Mustermann';
-- ---------------------------------------------------------------------------

\set ON_ERROR_STOP on

\if :{?email}
    SELECT
        count(*) = 0  AS kein_treffer,
        count(*) > 1  AS mehrere_treffer,
        min(id::text) AS kandidat_id
    FROM kandidat
    WHERE lower(email) = lower(:'email')
    \gset
    \if :kein_treffer
        \echo 'Abbruch: Kein Kandidat mit dieser E-Mail gefunden.'
        \quit
    \endif
    \if :mehrere_treffer
        \echo 'Abbruch: Mehrere Kandidaten mit dieser E-Mail. Bitte kandidat_id verwenden.'
        \quit
    \endif
\elif :{?kandidat_id}
\else
    \echo 'Abbruch: Bitte -v email=<E-Mail> oder -v kandidat_id=<uuid> angeben.'
    \quit
\endif

\echo 'Kandidat:' :kandidat_id

SELECT
    EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_name = 'verknuepfung_archiviert' AND column_name = 'status_geaendert_am') AS hat_v34,
    EXISTS (SELECT 1 FROM verknuepfung WHERE kandidat_id = :'kandidat_id')                   AS hat_aktuelle,
    EXISTS (SELECT 1 FROM verknuepfung_archiviert WHERE kandidat_id = :'kandidat_id')        AS hat_archivierte
\gset

\if :hat_v34
\else
    \echo 'Abbruch: Migration V34 fehlt (Spalte status_geaendert_am). Backend einmal starten.'
    \quit
\endif
\if :hat_aktuelle
    \echo 'Abbruch: Kandidat hat aktuelle Verknüpfungen. Diese zuerst löschen.'
    \quit
\endif
\if :hat_archivierte
\else
    \echo 'Abbruch: Kandidat hat keine archivierten Verknüpfungen.'
    \quit
\endif

BEGIN;

-- Latest "Reaktivieren" round of this Kandidat
CREATE TEMP TABLE runde ON COMMIT DROP AS
SELECT *
FROM verknuepfung_archiviert
WHERE kandidat_id = :'kandidat_id'
  AND archiviert_am = (SELECT max(archiviert_am) FROM verknuepfung_archiviert WHERE kandidat_id = :'kandidat_id');

INSERT INTO verknuepfung (id, suchauftrag_id, firma_id, kandidat_id, gebuehren, main_anteil,
                          verknuepfung_status, verknuepfung_status_kommentar, status_geaendert_am)
SELECT id, suchauftrag_id, firma_id, kandidat_id, gebuehren, main_anteil,
       verknuepfung_status, verknuepfung_status_kommentar, status_geaendert_am
FROM runde;

DELETE FROM verknuepfung_archiviert WHERE id IN (SELECT id FROM runde);

COMMIT;

\echo 'Reaktivieren rückgängig gemacht.'
