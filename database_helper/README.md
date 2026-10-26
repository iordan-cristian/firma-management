# Database helpers

psql scripts for testing the Kandidaten (Perm) tabs against a local or docker database.
They are **not** Flyway migrations and are never run automatically. Do not use them on
production data.

All scripts:
- need the backend to have been started once, so all migrations (up to V34) are applied,
- identify the Kandidat by `email` (case-insensitive, must be unique) **or** `kandidat_id`;
  if both are given, the e-mail wins,
- check everything first and abort with a message ("Abbruch: …") without changing data,
- run their changes in one transaction.

Run them from the project root. Locally:

```
psql -U postgres -d firma_management -v email=max@example.com [more -v …] -f database_helper/<script>.sql
```

With docker compose (script is piped in, so `-f -`):

```
docker compose exec -T db psql -U postgres -d firma_management \
    -v email=max@example.com [more -v …] -f - < database_helper/<script>.sql
```

Find a Kandidat's id or e-mail:

```sql
SELECT id, vorname, nachname, email FROM kandidat WHERE nachname = 'Mustermann';
```

## How the Bestand month works

A Kandidat is shown in the **current month** while its process is open. Once the process
is finished (all Verknüpfungen *Abgesagt*, or one *Prozess Rechnung vollständig bezahlt*),
it is shown in the month of the last status change (`verknuepfung.status_geaendert_am`;
for a paid process, the date of the paid Verknüpfung).

## `kandidat_in_vergangenheit.sql` – put a Kandidat into a past month

Sets `status_geaendert_am` of **all current** Verknüpfungen of the Kandidat to the given
date. Archived Verknüpfungen are not touched.

| Parameter | Required | Example |
|---|---|---|
| `email` or `kandidat_id` | yes | `max@example.com` |
| `datum` | yes, `YYYY-MM-DD` | `2026-08-15` |

```
psql -U postgres -d firma_management -v email=max@example.com -v datum=2026-08-15 -f database_helper/kandidat_in_vergangenheit.sql
```

Things to know:
- The Kandidat only moves if its **process is finished**. Set the statuses in the UI first
  (e.g. all to *Abgesagt*), then run the script. If the process is still open, the dates
  are set anyway, but the Kandidat stays in the current month and the script says so.
- Changing a status in the UI afterwards sets that Verknüpfung's date back to today.
- Aborts if the Kandidat has no current Verknüpfungen.

Typical test of "Reaktivieren":
1. Give the Kandidat Verknüpfungen and set all of them to *Abgesagt* in the UI.
2. Run `kandidat_in_vergangenheit.sql` with a date in a past month.
3. Reload the Bestand: the Kandidat is in that month, right-click shows *Reaktivieren*.

## `revert_reaktivieren.sql` – undo "Reaktivieren"

Moves the Verknüpfungen of the Kandidat's latest "Reaktivieren" round (newest
`archiviert_am`) from `verknuepfung_archiviert` back to `verknuepfung`, with their
original ids and `status_geaendert_am`. The Kandidat is then shown in its old month again.

| Parameter | Required | Example |
|---|---|---|
| `email` or `kandidat_id` | yes | `max@example.com` |

```
psql -U postgres -d firma_management -v email=max@example.com -f database_helper/revert_reaktivieren.sql
```

Things to know:
- Aborts if the Kandidat already has current Verknüpfungen (created after "Reaktivieren").
  Delete those first.
- Earlier rounds stay archived; run the script again to undo the next one.
