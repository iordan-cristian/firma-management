-- Optional sample data for development. Connect to firma_management first:
--   psql -U postgres -d firma_management -f 02_seed.sql
--
-- This script is idempotent: it uses fixed UUIDs and ON CONFLICT DO NOTHING
-- so it can be re-run without producing duplicates.
--
-- The admin user (admin/admin) is seeded by the Spring Boot DataInitializer
-- on first boot and is NOT inserted here.

BEGIN;
SET client_encoding = 'UTF8';
-- -- FIRMA -------------------------------------------------------------------
INSERT INTO firma (id, kontaktdaten, standort, allgemeiner_schwerpunkt) VALUES
    ('11111111-1111-1111-1111-111111111111',
     'info@alphabau.de | +49 30 1111111',
     'Berlin',
     'Bauwesen und Immobilienentwicklung'),
    ('22222222-2222-2222-2222-222222222222',
     'kontakt@bayernkapital.de | +49 89 2222222',
     'München',
     'Private Equity'),
    ('33333333-3333-3333-3333-333333333333',
     'office@hansagrupp.de | +49 40 3333333',
     'Hamburg',
     'Personalvermittlung'),
    ('44444444-4444-4444-4444-444444444444',
     'hello@rheinvertrieb.de | +49 221 4444444',
     'Köln',
     'Vertrieb und Distribution')
ON CONFLICT (id) DO NOTHING;


-- -- ANSPRECHPARTNER ---------------------------------------------------------
INSERT INTO ansprechpartner
    (id, firma_id, vorname, nachname, schwerpunkt, position, telefonnummer, email, kontaktinterval, informationen) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
     '11111111-1111-1111-1111-111111111111',
     'Anna', 'Müller', 'Projektsteuerung', 'Geschäftsführerin',
     '+49 30 1111111', 'a.mueller@alphabau.de',
     'Monatlich',
     'Hauptansprechpartnerin für alle Großprojekte. Bevorzugt Kontakt per E-Mail.'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02',
     '11111111-1111-1111-1111-111111111111',
     'Bernd', 'Schulz', 'Akquise', 'Vertriebsleiter',
     '+49 30 1111112', 'b.schulz@alphabau.de',
     'Quartalsweise',
     'Zuständig für die Akquise von Neukunden im Großraum Berlin.'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03',
     '22222222-2222-2222-2222-222222222222',
     'Clara', 'Hoffmann', 'Investorenbetreuung', 'Partnerin',
     '+49 89 2222223', 'c.hoffmann@bayernkapital.de',
     'Wöchentlich',
     'Sehr gut vernetzt im DACH-Raum, fokussiert auf institutionelle Investoren.'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04',
     '33333333-3333-3333-3333-333333333333',
     'David', 'Weber', 'Recruiting Tech', 'Senior Recruiter',
     '+49 40 3333334', 'd.weber@hansagrupp.de',
     'Monatlich',
     'Spezialisiert auf IT- und Engineering-Profile.'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05',
     '44444444-4444-4444-4444-444444444444',
     'Eva', 'Becker', 'Key Account', 'Head of Sales',
     '+49 221 4444445', 'e.becker@rheinvertrieb.de',
     'Monatlich',
     'Verantwortlich für Großkunden, sehr reaktionsschnell per Telefon.')
ON CONFLICT (id) DO NOTHING;


-- -- SUCHAUFTRAG -------------------------------------------------------------
-- Note: kernbereich and status use the enum NAMES (uppercase),
-- not the labels shown in the UI.
INSERT INTO suchauftrag
    (id, ansprechpartner_id, kernbereich, auftrag_placeholder, status) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
     'IMOBILIEN',
     'Suche Bürofläche 800-1200 qm in Berlin Mitte',
     'IN_ARBEIT'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02',
     'VERTRIEB',
     'Aufbau Vertriebskanal Region Brandenburg',
     'IN_ARBEIT'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03',
     'INVESTOREN',
     'Pre-Seed Investor für FinTech Startup',
     'FERTIG'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04',
     'PERSONAL',
     'Senior Backend Engineer Java/Spring Boot',
     'IN_ARBEIT'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05',
     'VERTRIEB',
     'Distribution Partner für DACH-Region',
     'FERTIG')
ON CONFLICT (id) DO NOTHING;


-- -- VERTRAG -----------------------------------------------------------------
INSERT INTO vertrag
    (id, ansprechpartner_id, firma_id, suchauftrag_id, wert, bezahlbar_am, bezahlt) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccc01',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
     '11111111-1111-1111-1111-111111111111',
     'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
     12500.00, DATE '2026-05-15', FALSE),
    ('cccccccc-cccc-cccc-cccc-cccccccccc02',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02',
     '11111111-1111-1111-1111-111111111111',
     'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
     7800.50, DATE '2026-06-30', FALSE),
    ('cccccccc-cccc-cccc-cccc-cccccccccc03',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03',
     '22222222-2222-2222-2222-222222222222',
     'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
     45000.00, DATE '2026-04-01', TRUE),
    ('cccccccc-cccc-cccc-cccc-cccccccccc04',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04',
     '33333333-3333-3333-3333-333333333333',
     'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04',
     9200.00, DATE '2026-07-10', FALSE),
    ('cccccccc-cccc-cccc-cccc-cccccccccc05',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05',
     '44444444-4444-4444-4444-444444444444',
     'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05',
     15750.00, DATE '2026-05-01', TRUE)
ON CONFLICT (id) DO NOTHING;

COMMIT;
