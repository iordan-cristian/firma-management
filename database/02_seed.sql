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
INSERT INTO firma (id, name, standort, allgemeiner_schwerpunkt, email, telefon, mobil, angebot_website) VALUES
    ('11111111-1111-1111-1111-111111111111',
     'Alpha Bau GmbH', 'Berlin', 'GEBAEUDETECHNIK',
     'info@alphabau.de', '+49 30 1111111', '+49 170 1111111', 'https://www.alphabau.de'),
    ('22222222-2222-2222-2222-222222222222',
     'Bayern Kapital AG', 'München', 'KAUFMAENNISCH',
     'kontakt@bayernkapital.de', '+49 89 2222222', '+49 171 2222222', 'https://www.bayernkapital.de'),
    ('33333333-3333-3333-3333-333333333333',
     'Hansa Grupp GmbH', 'Hamburg', 'INFORMATIK',
     'office@hansagrupp.de', '+49 40 3333333', '+49 172 3333333', 'https://www.hansagrupp.de'),
    ('44444444-4444-4444-4444-444444444444',
     'Rhein Vertrieb KG', 'Köln', 'MASCHINENBAU',
     'hello@rheinvertrieb.de', '+49 221 4444444', '+49 173 4444444', NULL)
ON CONFLICT (id) DO NOTHING;


-- -- ANSPRECHPARTNER ---------------------------------------------------------
INSERT INTO ansprechpartner
    (id, firma_id, vorname, nachname, schwerpunkt, position, telefonnummer, email, kontaktinterval, informationen, linkedin_profil, xing_profil) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
     '11111111-1111-1111-1111-111111111111',
     'Anna', 'Müller', 'Projektsteuerung', 'Geschäftsführerin',
     '+49 30 1111111', 'a.mueller@alphabau.de',
     'Monatlich',
     'Hauptansprechpartnerin für alle Großprojekte. Bevorzugt Kontakt per E-Mail.',
     'https://www.linkedin.com/in/anna-mueller', NULL),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02',
     '11111111-1111-1111-1111-111111111111',
     'Bernd', 'Schulz', 'Akquise', 'Vertriebsleiter',
     '+49 30 1111112', 'b.schulz@alphabau.de',
     'Quartalsweise',
     'Zuständig für die Akquise von Neukunden im Großraum Berlin.',
     NULL, 'https://www.xing.com/profile/Bernd_Schulz'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03',
     '22222222-2222-2222-2222-222222222222',
     'Clara', 'Hoffmann', 'Investorenbetreuung', 'Partnerin',
     '+49 89 2222223', 'c.hoffmann@bayernkapital.de',
     'Wöchentlich',
     'Sehr gut vernetzt im DACH-Raum, fokussiert auf institutionelle Investoren.',
     'https://www.linkedin.com/in/clara-hoffmann', 'https://www.xing.com/profile/Clara_Hoffmann'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04',
     '33333333-3333-3333-3333-333333333333',
     'David', 'Weber', 'Recruiting Tech', 'Senior Recruiter',
     '+49 40 3333334', 'd.weber@hansagrupp.de',
     'Monatlich',
     'Spezialisiert auf IT- und Engineering-Profile.',
     'https://www.linkedin.com/in/david-weber', NULL),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05',
     '44444444-4444-4444-4444-444444444444',
     'Eva', 'Becker', 'Key Account', 'Head of Sales',
     '+49 221 4444445', 'e.becker@rheinvertrieb.de',
     'Monatlich',
     'Verantwortlich für Großkunden, sehr reaktionsschnell per Telefon.',
     NULL, 'https://www.xing.com/profile/Eva_Becker')
ON CONFLICT (id) DO NOTHING;


-- -- SUCHAUFTRAG -------------------------------------------------------------
-- Note: aktivitaet and status use the enum NAMES (uppercase),
-- not the labels shown in the UI.
INSERT INTO suchauftrag
    (id, ansprechpartner_id, aktivitaet, ort, postleitzahl, adresse, fachlicher_skill,
     gehalt_mehr_info, gehalt_minimum, gehalt_maximum,
     berufserfahrung, branchenkenntnisse, zertifikate,
     deutsch, englisch, sonstige_sprachen, informationen,
     status, anlage_datum) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
     'IMOBILIEN', 'Berlin', NULL, NULL, 'Projektsteuerung, CAD, AutoCAD',
     'Firmenwagen, 30 Tage Urlaub', NULL, 90.00,
     '5+ Jahre', 'Bau, Immobilien', NULL,
     'C1', 'B2', NULL, 'Dringend gesucht, Stelle soll bis Q3 besetzt sein.',
     'IN_ARBEIT', DATE '2026-01-15'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02',
     'VERTRIEB', 'Berlin', NULL, NULL, 'B2B-Vertrieb, CRM, Kaltakquise',
     'Provision bis 20 %, Dienstwagen', 60.00, 80.00,
     '3+ Jahre', 'Bau, Handwerk', NULL,
     'MUTTERSPRACHE', 'B1', NULL, NULL,
     'IN_ARBEIT', DATE '2026-02-10'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03',
     'INVESTOREN', 'München', NULL, NULL, 'Finanzanalyse, Excel, Bloomberg',
     'Bonus bis 30 % des Jahresgehalts', 95.00, 130.00,
     '7+ Jahre', 'Finance, Private Equity', 'CFA',
     'MUTTERSPRACHE', 'C2', 'Französisch B2', 'Kandidat wurde erfolgreich platziert.',
     'FERTIG', DATE '2025-11-01'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04',
     'PERSONAL', 'Hamburg', NULL, NULL, 'Java, Spring Boot, Microservices',
     'Remote-Option, Weiterbildungsbudget', 80.00, 100.00,
     '4+ Jahre', 'IT, Software', 'AWS Certified',
     'B2', 'C1', NULL, 'Senior-Profil gewünscht, Teamleitung wäre ein Plus.',
     'IN_ARBEIT', DATE '2026-03-05'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05',
     'VERTRIEB', 'Köln', NULL, NULL, 'Key Account Management, SAP',
     NULL, 75.00, 95.00,
     '5+ Jahre', 'Logistik, Handel', NULL,
     'MUTTERSPRACHE', 'B2', NULL, NULL,
     'FERTIG', DATE '2025-12-20')
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
     45.00, DATE '2026-04-01', TRUE),
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
    id, dsgvo_bestaetigungs_datum, geschlecht, titel, vorname, nachname, postleitzahl, ort, geburtsjahr,
    staatsangehoerigkeit, familienstand, kinder,
    wochenstunden, wochenendbereitschaft, homeoffice,
    firmenwagenregelung, reisetaetigkeiten_mit_uebernachtung, taegliche_fahrzeit,
    deutsch, englisch, sonstige_sprachen,
    hochschulabschluss, berufsausbildung, autofuehrerschein, zertifikate,
    branchenkenntnisse, aktuelle_taetigkeiten, aktuelle_position, aktuelle_firma,
    wechselgruende, zukuenftige_position_taetigkeiten, kuendigungsfrist, erstes_online_meeting,
    firmen_selbevorben, firmen_nogo,
    email, telefon, linkedin_profil, xing_profil,
    fachlicher_skill, gehalt_minimum, gehalt_maximum
) VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddd01',
     DATE '2024-03-15', 'MAENNLICH', 'DR', 'Thomas', 'Müller', 80331, 'München', 1982,
     'Deutsch', 'verheiratet', '2',
     '40', 'nein', '2 Tage/Woche',
     'gewünscht', 'bis 5 Tage/Monat', 30,
     'MUTTERSPRACHE', 'C1', 'Französisch B1',
     'M.Sc. Maschinenbau (TU München)', NULL, 'VORHANDEN', 'PMP, Six Sigma Green Belt',
     'Automotive, Maschinenbau', 'Leitung von Entwicklungsprojekten, Teamführung',
     'Senior Project Manager', 'AutoTech Bayern AG',
     'Fehlende Aufstiegsmöglichkeiten', 'Head of Engineering / VP Engineering',
     '3 Monate', 'KW 22, flexibel',
     NULL, NULL,
     't.mueller@email.de', '+49 89 1234567', 'https://www.linkedin.com/in/thomas-mueller', NULL,
     'Projektmanagement, Lean Management', 90.00, 110.00),

    ('dddddddd-dddd-dddd-dddd-dddddddddd02',
     DATE '2024-06-01', 'WEIBLICH', NULL, 'Sarah', 'Fischer', 10115, 'Berlin', 1990,
     'Deutsch', 'ledig', 'keine',
     '38-40', 'gelegentlich', '3 Tage/Woche',
     'nicht gewünscht', 'nein', 45,
     'MUTTERSPRACHE', 'C2', 'Spanisch B2',
     'B.Sc. Wirtschaftsinformatik (HU Berlin)', NULL, 'VORHANDEN', 'Scrum Master, AWS Cloud Practitioner',
     'IT, E-Commerce, FinTech', 'Produktentwicklung, Stakeholder Management, Agile Coaching',
     'Product Manager', 'ShopWave GmbH',
     'Startup-Umgebung zu unstrukturiert', 'Senior Product Manager / Head of Product',
     '1 Monat', 'Ab sofort, bevorzugt morgens',
     NULL, NULL,
     's.fischer@email.de', '+49 30 2345678', 'https://www.linkedin.com/in/sarah-fischer', 'https://www.xing.com/profile/Sarah_Fischer',
     'Produktstrategie, Datenanalyse, UX', 70.00, 85.00),

    ('dddddddd-dddd-dddd-dddd-dddddddddd03',
     DATE '2023-11-20', 'MAENNLICH', 'ING', 'Klaus', 'Weber', 40213, 'Düsseldorf', 1975,
     'Deutsch', 'verheiratet', '3',
     '40-45', 'ja', '1 Tag/Woche',
     'vorhanden', 'bis 10 Tage/Monat', 60,
     'MUTTERSPRACHE', 'B2', NULL,
     NULL, 'Industriemechaniker', 'VORHANDEN', 'ISO 9001 Auditor',
     'Industrie, Produktion, Anlagenbau', 'Produktionsplanung, Qualitätssicherung, Lieferantenmanagement',
     'Werksleiter Produktion', 'MetallWerk Rheinland AG',
     'Werksschließung geplant', 'Plant Manager / Operations Director',
     '6 Monate', 'KW 23 oder 24, nachmittags',
     NULL, NULL,
     'k.weber@email.de', '+49 211 3456789', NULL, 'https://www.xing.com/profile/Klaus_Weber',
     'Fertigungssteuerung, Prozessoptimierung', 95.00, 120.00),

    ('dddddddd-dddd-dddd-dddd-dddddddddd04',
     DATE '2025-01-10', 'WEIBLICH', NULL, 'Maria', 'Schmidt', 20095, 'Hamburg', 1988,
     'Deutsch', 'ledig', 'keine',
     '30-35', 'nein', 'vollständig möglich',
     'nicht gewünscht', 'nein', 20,
     'MUTTERSPRACHE', 'C1', 'Niederländisch A2',
     'M.A. Marketing (Uni Hamburg)', NULL, 'VORHANDEN', 'Google Ads, HubSpot',
     'FMCG, Handel, digitale Medien', 'Content-Strategie, Social Media, Kampagnenmanagement',
     'Marketing Managerin', 'Nordlicht Handelshaus GmbH',
     'Wunsch nach mehr Remote-Flexibilität und internationalem Umfeld',
     'Head of Marketing / Senior Marketing Manager',
     '2 Monate', 'Flexibel, bevorzugt Donnerstag',
     NULL, NULL,
     'm.schmidt@email.de', '+49 40 4567890', 'https://www.linkedin.com/in/maria-schmidt', NULL,
     'Digitales Marketing, Markenführung', 55.00, 65.00),

    ('dddddddd-dddd-dddd-dddd-dddddddddd05',
     DATE '2024-09-05', 'MAENNLICH', NULL, 'Michael', 'Braun', 70173, 'Stuttgart', 1985,
     'Deutsch', 'verheiratet', '1',
     '40', 'gelegentlich', '2 Tage/Woche',
     'vorhanden', 'bis 8 Tage/Monat', 40,
     'MUTTERSPRACHE', 'B2', NULL,
     'B.A. Betriebswirtschaft (Uni Stuttgart)', NULL, 'VORHANDEN', NULL,
     'Logistik, Supply Chain, Handel', 'Prozessoptimierung, Teamführung, Budgetplanung',
     'Operations Manager', 'LogiTrans Süd GmbH',
     'Unternehmensfusion, neue Ausrichtung gewünscht',
     'Head of Operations / Supply Chain Manager',
     '3 Monate', 'KW 21, flexibel',
     NULL, NULL,
     'm.braun@email.de', '+49 711 5678901', 'https://www.linkedin.com/in/michael-braun', 'https://www.xing.com/profile/Michael_Braun',
     'Supply Chain Management, ERP-Systeme', 75.00, 90.00)
ON CONFLICT (id) DO NOTHING;

COMMIT;
