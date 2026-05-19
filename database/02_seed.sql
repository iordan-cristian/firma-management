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
INSERT INTO firma (id, name, standort, allgemeiner_schwerpunkt, email, telefon, mobil) VALUES
    ('11111111-1111-1111-1111-111111111111',
     'Alpha Bau GmbH', 'Berlin', 'GEBAEUDETECHNIK',
     'info@alphabau.de', '+49 30 1111111', '+49 170 1111111'),
    ('22222222-2222-2222-2222-222222222222',
     'Bayern Kapital AG', 'München', 'KAUFMAENNISCH',
     'kontakt@bayernkapital.de', '+49 89 2222222', '+49 171 2222222'),
    ('33333333-3333-3333-3333-333333333333',
     'Hansa Grupp GmbH', 'Hamburg', 'INFORMATIK',
     'office@hansagrupp.de', '+49 40 3333333', '+49 172 3333333'),
    ('44444444-4444-4444-4444-444444444444',
     'Rhein Vertrieb KG', 'Köln', 'MASCHINENBAU',
     'hello@rheinvertrieb.de', '+49 221 4444444', '+49 173 4444444')
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
-- Note: aktivitaet and status use the enum NAMES (uppercase),
-- not the labels shown in the UI.
INSERT INTO suchauftrag
    (id, ansprechpartner_id, aktivitaet, auftrag_placeholder, status) VALUES
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

-- -- KANDIDAT ----------------------------------------------------------------
INSERT INTO kandidat (
    id, geschlecht, titel, vorname, nachname, postleitzahl, ort, geburtsjahr,
    staatsangehoerigkeit, familienstand, kinder,
    wochenstunden, gehaltsrange, wochenendbereitschaft, homeoffice,
    firmenwagenregelung, reisetaetigkeiten_mit_uebernachtung, taegliche_fahrzeit,
    deutsch, englisch, sonstige_sprachen,
    hochschulabschluss, berufsausbildung, autofuehrerschein, fachspezifische_zertifikate,
    branchenkenntnisse, aktuelle_taetigkeiten, aktuelle_position,
    wechselgruende, zukuenftige_position_taetigkeiten, kuendigungsfrist, erstes_online_meeting
) VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddd01',
     'MAENNLICH', 'DR', 'Thomas', 'Müller', 80331, 'München', 1982,
     'Deutsch', 'verheiratet', '2',
     '40', '90000-110000', 'nein', '2 Tage/Woche',
     'gewünscht', 'bis 5 Tage/Monat', 30,
     'MUTTERSPRACHE', 'C1', 'Französisch B1',
     'M.Sc. Maschinenbau (TU München)', NULL, 'VORHANDEN', 'PMP, Six Sigma Green Belt',
     'Automotive, Maschinenbau', 'Leitung von Entwicklungsprojekten, Teamführung',
     'Senior Project Manager',
     'Fehlende Aufstiegsmöglichkeiten', 'Head of Engineering / VP Engineering',
     '3 Monate', 'KW 22, flexibel'),

    ('dddddddd-dddd-dddd-dddd-dddddddddd02',
     'WEIBLICH', NULL, 'Sarah', 'Fischer', 10115, 'Berlin', 1990,
     'Deutsch', 'ledig', 'keine',
     '38-40', '70000-85000', 'gelegentlich', '3 Tage/Woche',
     'nicht gewünscht', 'nein', 45,
     'MUTTERSPRACHE', 'C2', 'Spanisch B2',
     'B.Sc. Wirtschaftsinformatik (HU Berlin)', NULL, 'VORHANDEN', 'Scrum Master, AWS Cloud Practitioner',
     'IT, E-Commerce, FinTech', 'Produktentwicklung, Stakeholder Management, Agile Coaching',
     'Product Manager',
     'Startup-Umgebung zu unstrukturiert', 'Senior Product Manager / Head of Product',
     '1 Monat', 'Ab sofort, bevorzugt morgens'),

    ('dddddddd-dddd-dddd-dddd-dddddddddd03',
     'MAENNLICH', 'ING', 'Klaus', 'Weber', 40213, 'Düsseldorf', 1975,
     'Deutsch', 'verheiratet', '3',
     '40-45', '95000-120000', 'ja', '1 Tag/Woche',
     'vorhanden', 'bis 10 Tage/Monat', 60,
     'MUTTERSPRACHE', 'B2', NULL,
     NULL, 'Industriemechaniker', 'VORHANDEN', 'ISO 9001 Auditor',
     'Industrie, Produktion, Anlagenbau', 'Produktionsplanung, Qualitätssicherung, Lieferantenmanagement',
     'Werksleiter Produktion',
     'Werksschließung geplant', 'Plant Manager / Operations Director',
     '6 Monate', 'KW 23 oder 24, nachmittags'),

    ('dddddddd-dddd-dddd-dddd-dddddddddd04',
     'WEIBLICH', NULL, 'Maria', 'Schmidt', 20095, 'Hamburg', 1988,
     'Deutsch', 'ledig', 'keine',
     '30-35', '55000-65000', 'nein', 'vollständig möglich',
     'nicht gewünscht', 'nein', 20,
     'MUTTERSPRACHE', 'C1', 'Niederländisch A2',
     'M.A. Marketing (Uni Hamburg)', NULL, 'VORHANDEN', 'Google Ads, HubSpot',
     'FMCG, Handel, digitale Medien', 'Content-Strategie, Social Media, Kampagnenmanagement',
     'Marketing Managerin',
     'Wunsch nach mehr Remote-Flexibilität und internationalem Umfeld',
     'Head of Marketing / Senior Marketing Manager',
     '2 Monate', 'Flexibel, bevorzugt Donnerstag'),

    ('dddddddd-dddd-dddd-dddd-dddddddddd05',
     'MAENNLICH', NULL, 'Michael', 'Braun', 70173, 'Stuttgart', 1985,
     'Deutsch', 'verheiratet', '1',
     '40', '75000-90000', 'gelegentlich', '2 Tage/Woche',
     'vorhanden', 'bis 8 Tage/Monat', 40,
     'MUTTERSPRACHE', 'B2', NULL,
     'B.A. Betriebswirtschaft (Uni Stuttgart)', NULL, 'VORHANDEN', NULL,
     'Logistik, Supply Chain, Handel', 'Prozessoptimierung, Teamführung, Budgetplanung',
     'Operations Manager',
     'Unternehmensfusion, neue Ausrichtung gewünscht',
     'Head of Operations / Supply Chain Manager',
     '3 Monate', 'KW 21, flexibel')
ON CONFLICT (id) DO NOTHING;

COMMIT;
