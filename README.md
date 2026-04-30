# Firma Management — Monorepo

Full-stack project with a Spring Boot backend and an Angular frontend in a single repository.

```
.
├── settings.gradle
├── build.gradle
├── backend/                # Spring Boot 3 + Spring Security + JPA + JWT (Gradle)
└── frontend/               # Angular 18 (standalone components)
```

## Stack

- **Backend**: Spring Boot 3.3, Spring Security, Spring Data JPA, PostgreSQL, JWT (jjwt 0.12), Java 21, Gradle
- **Frontend**: Angular 18 (standalone components, functional guards & interceptors), TypeScript 5.5
- **Auth**: JWT bearer tokens. Default user seeded on startup → `admin` / `admin`

## 1. Database

Create a Postgres database called `firma_management`:

```sql
CREATE DATABASE firma_management;
```

Defaults assumed by `backend/src/main/resources/application.yml`:

| Setting   | Value      |
|-----------|------------|
| Host      | localhost  |
| Port      | 5432       |
| User      | postgres   |
| Password  | postgres   |

JPA is configured with `ddl-auto: update`, so the tables (`firma`, `ansprechpartner`, `suchauftrag`, `vertrag`, `app_user`) are created automatically on first run.

## 2. Run the backend

```bash
./gradlew :backend:bootRun
```

Backend is exposed on **http://localhost:8080**. On first start, an admin user (`admin` / `admin`) is seeded.

## 3. Run the frontend

```bash
cd frontend
npm install
npm start
```

Frontend is served on **http://localhost:4200**. The backend's CORS config already allows that origin.

## 4. Login

Navigate to http://localhost:4200, log in with `admin` / `admin`. The token is stored in localStorage and attached automatically to API requests by `jwt.interceptor.ts`.

## REST API summary

All endpoints (except `/api/auth/login`) require `Authorization: Bearer <token>`.

### Auth
- `POST /api/auth/login` → `{ token, username, role }`

### Firma
- `GET    /api/firma`                              — getallFirma
- `GET    /api/firma/{id}`
- `POST   /api/firma`
- `PUT    /api/firma/{id}`
- `DELETE /api/firma/{id}`
- `GET    /api/firma/{id}/ansprechpartner`         — getallAnsprechpartnerForFirma
- `GET    /api/firma/{id}/suchauftrag`             — getallSuchauftragForFirma
- `GET    /api/firma/{id}/vertrag`                 — getallVertragForFirma

### Ansprechpartner
- `GET    /api/ansprechpartner`
- `GET    /api/ansprechpartner/{id}`
- `POST   /api/ansprechpartner`
- `PUT    /api/ansprechpartner/{id}`
- `DELETE /api/ansprechpartner/{id}`
- `GET    /api/ansprechpartner/{id}/vertrag`       — getallVertragForAnsprechpartner

### Suchauftrag
- `GET    /api/suchauftrag?status=in%20Arbeit`     — getallSuchauftrag, optional `status` filter
- `GET    /api/suchauftrag/{id}`
- `POST   /api/suchauftrag`
- `PUT    /api/suchauftrag/{id}`
- `DELETE /api/suchauftrag/{id}`

### Vertrag
- `GET    /api/vertrag`                            — getallVertrag (sorted by `bezahlbarAm` asc)
- `GET    /api/vertrag/{id}`
- `POST   /api/vertrag`
- `PUT    /api/vertrag/{id}`
- `DELETE /api/vertrag/{id}`

## Domain model

- **Firma**: `id (UUID)`, `kontaktdaten`, `standort`, `allgemeinerSchwerpunkt`
- **Ansprechpartner**: `id (UUID)`, `firmaId (FK→Firma)`, `vorname`, `nachname`, `schwerpunkt`, `position`, `telefonnummer` (validated as phone), `email` (validated as e-mail), `kontaktinterval`, `informationen` (long text)
- **Suchauftrag**: `id (UUID)`, `ansprechpartnerId (FK→Ansprechpartner)`, `kernbereich (enum: Investoren | Vertrieb | Imobilien | Personal)`, `auftragPlaceholder`, `status (enum: in Arbeit | Fertig)`
- **Vertrag**: `id (UUID)`, `ansprechpartnerId (FK)`, `firmaId (FK)`, `vorname`, `suchauftragId (FK)`, `wert (decimal)`, `bezahlbarAm (date — dd/MM/yyyy on the wire)`, `bezahlt (boolean)`

## UI structure

- `/login` — username/password form (default `admin`/`admin`)
- `/` — landing page that just says "Work in progress"
- Right-side menu lists: **Firmen**, **Suchaufträge**, **Verträge**
- **Firmen**: table of all Firma rows. Right-click a row to open a context menu → **Ansprechpartner** / **Suchaufträge** / **Verträge**, each rendered in a card-based layout
- **Suchaufträge**: defaults to `in Arbeit`; toggle to show all
- **Verträge**: all Verträge sorted by `bezahlbarAm` ascending

## Notes

- Frontend uses Angular standalone components with `provideHttpClient(withInterceptors(...))` and `provideRouter(...)` (the modern Angular 18 setup — no NgModules).
- `app.jwt.secret` in `application.yml` is a development placeholder. Replace with a real base64-encoded 256-bit secret before deploying.
