-- ---------------------------------------------------------------------------
-- Put a Kandidat into a past month (for testing only)
-- ---------------------------------------------------------------------------
-- What it does:
--   The Kandidaten (Perm) Bestand shows a Kandidat in the month its process was
--   finished, derived from verknuepfung.status_geaendert_am (see V34). This
--   script sets status_geaendert_am of ALL current Verknüpfungen of one
--   Kandidat to the given date, so the Kandidat moves to that month.
--   Archived Verknüpfungen (verknuepfung_archiviert) are not touched.
--
--   The Kandidat only leaves the current month if its process is finished:
--   all Verknüpfungen Abgesagt, or one "Prozess Rechnung vollständig bezahlt".
--   Otherwise the dates are still set, but the Kandidat stays in the current
--   month (the script prints a hint). Set the statuses in the UI first.
--
-- Safety:
--   Aborts without changes if migration V34 is missing, the date is invalid or
--   the Kandidat has no current Verknüpfungen. Runs in one transaction.
--   Note: the next status change of a Verknüpfung in the UI sets its date back
--   to today.
--
-- Usage (psql): identify the Kandidat by e-mail OR by id, date as YYYY-MM-DD
--   psql -U postgres -d firma_management -v email=max@example.com -v datum=2026-08-15 -f database_helper/kandidat_in_vergangenheit.sql
--   psql -U postgres -d firma_management -v kandidat_id=<uuid>     -v datum=2026-08-15 -f database_helper/kandidat_in_vergangenheit.sql
--
--   The e-mail is compared case-insensitively and must match exactly one
--   Kandidat; otherwise the script aborts (then use kandidat_id). If both are
--   given, the e-mail wins.
--
--   With docker compose:
--   docker compose exec -T db psql -U postgres -d firma_management \
--       -v email=max@example.com -v datum=2026-08-15 -f - < database_helper/kandidat_in_vergangenheit.sql
-- ---------------------------------------------------------------------------

\set ON_ERROR_STOP on

\if :{?datum}
\else
    \echo 'Abbruch: Bitte -v datum=YYYY-MM-DD angeben.'
    \quit
\endif

-- Fails (and stops the script) if the date is invalid
SELECT :'datum'::date AS datum \gset

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
\echo 'Datum:   ' :datum

SELECT
    EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_name = 'verknuepfung' AND column_name = 'status_geaendert_am') AS hat_v34,
    EXISTS (SELECT 1 FROM verknuepfung WHERE kandidat_id = :'kandidat_id')            AS hat_aktuelle,
    -- Same rule as isProzessBeendet() in verknuepfung-status.model.ts
    EXISTS (SELECT 1 FROM verknuepfung
            WHERE kandidat_id = :'kandidat_id'
              AND verknuepfung_status = 'PROZESS_RECHNUNG_VOLLSTAENDIG_BEZAHLT')
        OR NOT EXISTS (SELECT 1 FROM verknuepfung
                       WHERE kandidat_id = :'kandidat_id'
                         AND (verknuepfung_status IS NULL OR verknuepfung_status <> 'ABGESAGT')) AS beendet
\gset

\if :hat_v34
\else
    \echo 'Abbruch: Migration V34 fehlt (Spalte status_geaendert_am). Backend einmal starten.'
    \quit
\endif
\if :hat_aktuelle
\else
    \echo 'Abbruch: Kandidat hat keine aktuellen Verknüpfungen.'
    \quit
\endif

BEGIN;

UPDATE verknuepfung
SET status_geaendert_am = :'datum'
WHERE kandidat_id = :'kandidat_id';

COMMIT;

\if :beendet
    \echo 'Fertig: Kandidat erscheint im Bestand im Monat von' :datum
\else
    \echo 'Datum gesetzt, aber der Prozess ist nicht beendet (nicht alle Abgesagt / keine vollständig bezahlt).'
    \echo 'Der Kandidat bleibt daher im aktuellen Monat.'
\endif
