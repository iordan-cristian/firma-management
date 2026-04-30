# Database scripts

SQL scripts for the `firma_management` Postgres database.

| File                       | Purpose                                                | Connect to       |
|----------------------------|--------------------------------------------------------|------------------|
| `00_create_database.sql`   | Drops and recreates the `firma_management` database    | `postgres`       |
| `01_schema.sql`            | Creates all tables, indexes, FKs, and CHECK constraints| `firma_management` |
| `02_seed.sql`              | Inserts sample Firma / Ansprechpartner / Suchauftrag / Vertrag rows | `firma_management` |
| `99_drop.sql`              | Drops every table created by `01_schema.sql`           | `firma_management` |
| `setup.sh`, `setup.bat`    | Runs 00, 01, 02 in order                               | —                |

## Quick start (Windows / Linux / macOS)

```bash
# Linux / macOS
chmod +x setup.sh
./setup.sh

# Windows
setup.bat
```

The scripts assume `psql` is on PATH and that the postgres superuser is reachable on `localhost:5432`. Override with environment variables:

```bash
PGUSER=postgres PGPASSWORD=secret PGHOST=localhost PGPORT=5432 ./setup.sh
```

## Manual run

```bash
psql -U postgres -d postgres            -f 00_create_database.sql
psql -U postgres -d firma_management    -f 01_schema.sql
psql -U postgres -d firma_management    -f 02_seed.sql
```

## Notes on JPA and these scripts

- The Spring Boot backend ships with `spring.jpa.hibernate.ddl-auto: update`, which is happy to find the tables already there — Hibernate will simply validate them and add anything missing. **No change to `application.yml` is required to use these scripts.**
- If you'd rather Hibernate never touch the schema, change `ddl-auto` to `validate` (verifies the schema matches the entities and fails if it doesn't) or `none`.
- The admin user (`admin` / `admin`) is **not** in `02_seed.sql`. The Spring Boot `DataInitializer` seeds it on first startup using a freshly generated BCrypt hash, which is safer than committing a hash to the repo.
- Enum columns (`suchauftrag.kernbereich`, `suchauftrag.status`) store the Java enum **name** (uppercase: `INVESTOREN`, `IN_ARBEIT`, …) because the entities use `@Enumerated(EnumType.STRING)`. The API translates between those names and the user-facing labels (`Investoren`, `in Arbeit`, …).
- `bezahlbar_am` is a `DATE`. The `dd/MM/yyyy` formatting is purely a JSON serialization concern handled by Jackson on the Java side.

## Reset

To wipe and rebuild from scratch:

```bash
psql -U postgres -d firma_management -f 99_drop.sql
psql -U postgres -d firma_management -f 01_schema.sql
psql -U postgres -d firma_management -f 02_seed.sql
```
