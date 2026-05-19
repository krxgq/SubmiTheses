#!/bin/bash
# Presentation seed script for SubmiTheses
# Clears all data and fills the DB with realistic demo data.
# Run from the project root after: docker compose up -d

set -e
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

PSQL="docker exec -i submitheses-postgres psql -U postgres -d submitheses"
BCRYPT="/home/krxg/Desktop/SumbiTheses/backend/node_modules/bcrypt"

echo "=== SubmiTheses — prezentacni data ==="
echo ""

# ── UUIDs ─────────────────────────────────────────────────────────────────────
ADMIN_UUID=$(cat /proc/sys/kernel/random/uuid)
TEACHER1_UUID=$(cat /proc/sys/kernel/random/uuid)
TEACHER2_UUID=$(cat /proc/sys/kernel/random/uuid)
TEACHER3_UUID=$(cat /proc/sys/kernel/random/uuid)
STUDENT1_UUID=$(cat /proc/sys/kernel/random/uuid)
STUDENT2_UUID=$(cat /proc/sys/kernel/random/uuid)
STUDENT3_UUID=$(cat /proc/sys/kernel/random/uuid)
STUDENT4_UUID=$(cat /proc/sys/kernel/random/uuid)
STUDENT5_UUID=$(cat /proc/sys/kernel/random/uuid)

# ── Bcrypt hashes via host Node.js ────────────────────────────────────────────
echo "Hashing hesel..."
ADMIN_HASH=$(node   -e "require('$BCRYPT').hash('Admin1234!',  10).then(h=>process.stdout.write(h))")
TEACHER_HASH=$(node -e "require('$BCRYPT').hash('Teacher1234!',10).then(h=>process.stdout.write(h))")
STUDENT_HASH=$(node -e "require('$BCRYPT').hash('Student1234!',10).then(h=>process.stdout.write(h))")

# ── Wipe ──────────────────────────────────────────────────────────────────────
echo "Mazam stara data..."
$PSQL << 'SQL'
TRUNCATE TABLE
  activity_logs, notifications, project_signups, reviews, grades,
  scale_set_scales, scale_sets, scales, external_links, attachments,
  project_descriptions, projects, subjects, users, years
RESTART IDENTITY CASCADE;
SQL

# ── Year ──────────────────────────────────────────────────────────────────────
echo "Vkladam rok..."
$PSQL << 'SQL'
INSERT INTO public.years (id, name, assignment_date, submission_date, feedback_date, created_at)
VALUES (1, '2024/2025',
  '2024-10-01 00:00:00+00',
  '2025-05-31 23:59:59+00',
  '2025-06-30 23:59:59+00',
  NOW());
SQL

# ── Subjects ──────────────────────────────────────────────────────────────────
$PSQL << 'SQL'
INSERT INTO public.subjects (id, name, description, is_active, created_at, updated_at) VALUES
  (1, 'Informacni technologie',  'Moderni IT technologie a jejich aplikace', true, NOW(), NOW()),
  (2, 'Softwarove inzenyrstvi',  'Vyvoj softwaru, metodiky a nastroje',      true, NOW(), NOW()),
  (3, 'Pocitacove site',         'Sitova infrastruktura a protokoly',        true, NOW(), NOW()),
  (4, 'Kyberneticka bezpecnost', 'Bezpecnost informacnich systemu',          true, NOW(), NOW());
SQL

# ── Users ─────────────────────────────────────────────────────────────────────
echo "Vkladam uzivatele..."
$PSQL << SQL
INSERT INTO public.users
  (id, role, first_name, last_name, email, password_hash, auth_provider, email_verified, year_id, created_at, updated_at)
VALUES
  ('$ADMIN_UUID',    'admin',   'Admin',  'SubmiTheses', 'admin@demo.cz',     '$ADMIN_HASH',   'local', true, 1, NOW(), NOW()),
  ('$TEACHER1_UUID', 'teacher', 'Jan',    'Novak',       'novak@demo.cz',     '$TEACHER_HASH', 'local', true, 1, NOW(), NOW()),
  ('$TEACHER2_UUID', 'teacher', 'Petra',  'Dvorak',      'dvorak@demo.cz',    '$TEACHER_HASH', 'local', true, 1, NOW(), NOW()),
  ('$TEACHER3_UUID', 'teacher', 'Martin', 'Kovar',       'kovar@demo.cz',     '$TEACHER_HASH', 'local', true, 1, NOW(), NOW()),
  ('$STUDENT1_UUID', 'student', 'Eva',    'Svobodova',   'svobodova@demo.cz', '$STUDENT_HASH', 'local', true, 1, NOW(), NOW()),
  ('$STUDENT2_UUID', 'student', 'Tomas',  'Horak',       'horak@demo.cz',     '$STUDENT_HASH', 'local', true, 1, NOW(), NOW()),
  ('$STUDENT3_UUID', 'student', 'Lucie',  'Novakova',    'novakova@demo.cz',  '$STUDENT_HASH', 'local', true, 1, NOW(), NOW()),
  ('$STUDENT4_UUID', 'student', 'Pavel',  'Krejci',      'krejci@demo.cz',    '$STUDENT_HASH', 'local', true, 1, NOW(), NOW()),
  ('$STUDENT5_UUID', 'student', 'Ondrej', 'Cerny',       'cerny@demo.cz',     '$STUDENT_HASH', 'local', true, 1, NOW(), NOW());
SQL

# ── Projects ──────────────────────────────────────────────────────────────────
# proj 1 & 5 → public (grades visible), 2 & 3 → locked (under review), 4 → draft (in progress)
echo "Vkladam projekty..."
$PSQL << SQL
INSERT INTO public.projects
  (id, title, supervisor_id, opponent_id, student_id, subject, subject_id, year_id, status, main_documentation, updated_at)
VALUES
  (1, 'System pro spravu studentskych zaverecnych praci',
   '$TEACHER1_UUID', '$TEACHER2_UUID', '$STUDENT1_UUID',
   'Softwarove inzenyrstvi', 2, 1, 'public',
   'Tato bakalaraska prace se zabyva navrhem a implementaci weboveho systemu pro spravu zaverecnych studentskych praci. Aplikace umoznuje evidenci praci, prirazovani vedoucich a oponentu, spravu priloh a plne digitalizovane hodnoceni. System byl implementovan s vyuzitim Next.js, Node.js a PostgreSQL.',
   NOW() - INTERVAL '2 days'),
  (2, 'Analyza sitoveho provozu pomoci strojoveho uceni',
   '$TEACHER2_UUID', '$TEACHER3_UUID', '$STUDENT2_UUID',
   'Pocitacove site', 3, 1, 'locked',
   'Prace implementuje system pro real-time detekci anomalii v sitovem provozu pomoci algoritmu strojoveho uceni. Implementovany model Isolation Forest a LSTM autoencoder dosahuje presnosti 93,4 % pri rate falesnych poplachu pod 2 %.',
   NOW() - INTERVAL '5 days'),
  (3, 'Webova aplikace pro spravu projektu v agilnim prostredi',
   '$TEACHER3_UUID', '$TEACHER1_UUID', '$STUDENT3_UUID',
   'Informacni technologie', 1, 1, 'locked',
   'Prace popisuje navrh a vyvoj webove aplikace pro spravu projektovych timu podle metodiky Scrum. Aplikace zahrnuje sprinty, backlog, burndown grafy a integraci s externimi nastroji pro timovou komunikaci.',
   NOW() - INTERVAL '8 days'),
  (4, 'Mobilni aplikace pro vyuku zakladu programovani',
   '$TEACHER1_UUID', '$TEACHER3_UUID', '$STUDENT5_UUID',
   'Informacni technologie', 1, 1, 'draft',
   NULL,
   NOW() - INTERVAL '20 days'),
  (5, 'Bezpecnostni audit cloudove infrastruktury',
   '$TEACHER2_UUID', '$TEACHER1_UUID', '$STUDENT4_UUID',
   'Kyberneticka bezpecnost', 4, 1, 'public',
   'Prace se zabyva komplexnim bezpecnostnim auditem cloudove infrastruktury v prostredi AWS. Byl proveden penetracni test, analyza konfigurace IAM, sifrovani dat a odhaleno celkem 12 zranitelnosti kategorie Medium az Critical vcetne doporuceni remediaci.',
   NOW() - INTERVAL '4 days');
SQL

# ── Project descriptions ──────────────────────────────────────────────────────
echo "Vkladam popisy projektu..."
$PSQL << 'SQL'
INSERT INTO public.project_descriptions
  (project_id, topic, project_goal, specification, schedule, needed_output, grading_criteria, grading_notes, created_at, updated_at)
VALUES
(1,
 'Navrh a implementace weboveho systemu pro spravu zaverecnych praci na akademickem pracovisti',
 'Cilem prace je analyzovat stavajici procesy spravy zaverecnych praci a navrhnout moderni webovou aplikaci, ktera zjednoduci evidenci, prirazovani vedoucich a oponentu, spravu priloh a hodnoceni. Vysledny system nahrazuje papirovou administraci plne digitalnim resenim.',
 E'## Technicka specifikace\n\nAplikace je postavena na modernim webovem stacku:\n\n- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS\n- **Backend**: Node.js, Express, Prisma ORM\n- **Databaze**: PostgreSQL\n- **Autentizace**: JWT tokeny, role-based access control\n\n### Klicove funkce\n1. Sprava uzivatelu (admin, ucitel, student)\n2. Vytvareni a editace projektu\n3. Prirazovani vedoucich a oponentu\n4. Upload a sprava priloh\n5. Hodnotici formulare s vazenym prumerem\n6. Export posudku do PDF',
 '[{"task":"Analyza pozadavku a navrh architektury","date":"2024-11-15","completed":true},{"task":"Implementace backendu a databazove vrstvy","date":"2025-01-31","completed":true},{"task":"Vyvoj frontend rozhrani","date":"2025-03-15","completed":true},{"task":"Testovani a ladeni systemu","date":"2025-04-30","completed":true},{"task":"Dokumentace a finalni odevzdani","date":"2025-05-31","completed":true}]',
 ARRAY['Funkcni webova aplikace nasazena na produkci','Zdrojovy kod s dokumentaci na GitHubu','Technicka zprava min. 40 stran','Uzivatelska prirucka','Prezentace vysledku'],
 ARRAY['Technicka uroven implementace','Kvalita uzivatelske dokumentace','Splneni vsech funkcnich pozadavku','Prehlednost a udrzovatelnost kodu'],
 'Prace splnuje vsechny pozadavky zadani. Doporucuji hodnoceni vyborne.',
 NOW(), NOW()),
(2,
 'Detekce anomalii v sitovem provozu pomoci algoritmu strojoveho uceni',
 'Prace se zameruje na implementaci systemu pro real-time detekci anomalii v sitovem provozu. Cilem je dosahnout presnosti nad 90 % pri zachovani nizke miry falesnych poplachu.',
 E'## Specifikace systemu\n\n### Vstupni data\n- Sitove pakety ve formatu PCAP\n- NetFlow zaznamy ze smerovace\n- Systemove logy serveru\n\n### Pouzite algoritmy\n- **Isolation Forest** pro detekci outlieru\n- **LSTM autoencoder** pro sekvencni analyzu\n- **K-means clustering** pro kategorizaci provozu\n\n### Vystupy\n- Real-time dashboard s vizualizaci anomalii\n- Alertovaci system s notifikacemi\n- Exportovatelne reporty v PDF formatu',
 '[{"task":"Sber a priprava datove sady","date":"2024-11-30","completed":true},{"task":"Implementace ML modelu","date":"2025-02-28","completed":true},{"task":"Integrace real-time monitoringu","date":"2025-04-15","completed":true},{"task":"Vyhodnoceni presnosti a dokumentace","date":"2025-05-31","completed":true}]',
 ARRAY['ML model s presnosti >90%','Real-time monitoring dashboard','Technicka dokumentace algoritmu','Srovnavaci studie metod detekce anomalii'],
 ARRAY['Presnost ML modelu','Kvalita technicke dokumentace','Prehlednost vizualizace dat','Interpretace vysledku experimentu'],
 'Presnost modelu 93,4 % prekonala stanoveny cil. Silna prace.',
 NOW(), NOW()),
(3,
 'Navrh a implementace nastroje pro agilni spravu projektu s podporou metodiky Scrum',
 'Cilem je navrhnout webovou aplikaci pro efektivni spravu projektu v agilnim prostredi. Aplikace bude podporovat sprintove planovani, evidenci user stories, burndown grafy a notifikace pro cleny tymu.',
 E'## Technicka specifikace\n\n- **Frontend**: React 18, TypeScript, Ant Design\n- **Backend**: Node.js, NestJS, TypeORM\n- **Databaze**: MySQL\n- **CI/CD**: GitHub Actions\n\n### Klicove moduly\n1. Sprava sprintu a produktoveho backlogu\n2. Kanban tabule s drag-and-drop\n3. Burndown a velocity grafy\n4. Integrace s GitHub repozitarem\n5. Tymy a role (Product Owner, Scrum Master, Developer)',
 '[{"task":"Navrh datoveho modelu a REST API","date":"2024-12-01","completed":true},{"task":"Implementace jadra aplikace","date":"2025-02-15","completed":true},{"task":"Vyvoj vizualizaci a grafu","date":"2025-04-01","completed":true},{"task":"Testovani a QA","date":"2025-05-15","completed":true},{"task":"Finalni dokumentace","date":"2025-05-31","completed":false}]',
 ARRAY['Webova aplikace s agilnimi nastroji','Technicka a uzivatelska dokumentace','Uzivatelske testy se 5 ucastniky','Zdrojovy kod na GitHubu s CI/CD'],
 ARRAY['Funkcnost agilnich nastroju','Kvalita uzivatelske dokumentace','Vysledky uzivatelskych testu','Integrace s externimi nastroji'],
 'Aplikace je funkcni a splnuje zadani. Chybi mobilni verze a sirsi test coverage.',
 NOW(), NOW()),
(4,
 'Interaktivni mobilni aplikace pro vyuku zakladu programovani u zaku zakladnich skol',
 'Cilem je vytvorit mobilni aplikaci pro Android a iOS, ktera gamifikovanym zpusobem uci zaky algoritmickeho mysleni a programovani v Scratchi a Pythonu. Aplikace vyuziva adaptivni obtiznost a okamzitou zpetnou vazbu.',
 E'## Technicka specifikace\n\n- **Framework**: Flutter (Dart)\n- **Backend**: Firebase (Auth, Firestore, Storage)\n- **Platformy**: Android 10+, iOS 14+\n\n### Pedagogicky pristup\n- Gamifikace: body, odznaky, zebricek\n- Adaptivni obtiznost dle vysledku zaka\n- Vizualni programovani (bloky) → textovy kod\n- 50 interaktivnich lekci v 5 modulech\n\n### Moduly\n1. Zaklady algoritmickeho mysleni\n2. Promenne a datove typy\n3. Podminky a cykly\n4. Funkce a rekurze\n5. Zaklady OOP v Pythonu',
 '[{"task":"Pruzkum pedagogickych metod a analyza konkurence","date":"2025-01-15","completed":true},{"task":"Navrh UI/UX a interaktivni prototyp","date":"2025-02-28","completed":true},{"task":"Implementace jadra aplikace a lekci","date":"2025-04-15","completed":false},{"task":"Pilotni testovani s cilovymi uzivateli","date":"2025-05-15","completed":false},{"task":"Dokumentace a finalni odevzdani","date":"2025-05-31","completed":false}]',
 ARRAY['Mobilni aplikace pro Android a iOS','50 interaktivnich lekci ve 5 modulech','Vysledky pilotniho testovani se zaky','Technicka a pedagogicka dokumentace'],
 ARRAY['Pedagogicka efektivita aplikace','Technicka kvalita implementace','Uzivatelska zkusenost (UX)','Komplexnost obsahu lekci'],
 NULL,
 NOW(), NOW()),
(5,
 'Bezpecnostni audit a penetracni test cloudove infrastruktury spolecnosti v prostredi AWS',
 'Prace provadi komplexni bezpecnostni audit cloudove infrastruktury provozovane na AWS. Zahrnuje penetracni test, analyzu IAM politik, sitove segmentace, sifrovani dat a navrh remediaci pro vsechny nalezene zranitelnosti.',
 E'## Metodika auditu\n\n### Faze 1 — Reconnaissance\n- Mapovani AWS infrastruktury (EC2, S3, RDS, Lambda)\n- Analyza IAM roli a politik\n- Sken otevrenych portu a exponovanych sluzeb\n\n### Faze 2 — Vulnerability Assessment\n- OWASP Top 10 kontrola webovych sluzeb\n- Testovani SQL injection, XSS, SSRF\n- Kontrola sifrovani S3 bucketu a RDS databazi\n\n### Faze 3 — Penetracni test\n- Eskalace opravneni pres misconfigured IAM role\n- Lateralni pohyb v siti\n- Demonstrace dopadu kriticke zranitelnosti\n\n### Faze 4 — Reportovani\n- CVSS scoring vsech 12 zranitelnosti\n- Executive summary + technicka zprava\n- Akcni plan remediaci s prioritami',
 '[{"task":"Analyza prostredi a navrh testovaci metodiky","date":"2024-12-15","completed":true},{"task":"Reconnaissance a sber informaci","date":"2025-02-01","completed":true},{"task":"Vulnerability assessment","date":"2025-03-15","completed":true},{"task":"Penetracni testovani a eskalace","date":"2025-04-30","completed":true},{"task":"Finalni zprava a doporuceni remediaci","date":"2025-05-31","completed":true}]',
 ARRAY['Kompletni bezpecnostni zprava s CVSS scoring','Executive summary pro management','Akcni plan remediaci s casovymi odhady','Technicka dokumentace testovaci metodiky'],
 ARRAY['Sirka a hloubka auditu','Presnost CVSS scoringu','Kvalita doporuceni remediaci','Struktura a srozumitelnost zpravy'],
 'Vyjimecna prace. Nalezene zranitelnosti maji realny dopad. Doporucuji jako vzorovou praci.',
 NOW(), NOW());
SQL

# ── Scales ────────────────────────────────────────────────────────────────────
echo "Vkladam stupnice..."
$PSQL << 'SQL'
INSERT INTO public.scales (id, "maxVal", name, "desc", created_at) VALUES
  (1, 20, 'Technicka uroven',    'Kvalita implementace, architektura a pouzite technologie', NOW()),
  (2, 20, 'Odborna analyza',     'Hloubka analyzy problematiky a prehled literatury',        NOW()),
  (3, 20, 'Originalita reseni',  'Inovativnost a originalita navrhovaneho reseni',            NOW()),
  (4, 20, 'Kvalita dokumentace', 'Srozumitelnost, uplnost a formalni spravnost dokumentace', NOW()),
  (5, 20, 'Splneni cilu',        'Mira splneni zadanych cilu a pozadavku prace',             NOW());
SQL

# ── Scale sets ────────────────────────────────────────────────────────────────
$PSQL << 'SQL'
INSERT INTO public.scale_sets (id, name, year_id, project_role, created_at) VALUES
  (1, 'Hodnoceni vedouciho 2024/2025', 1, 'supervisor', NOW()),
  (2, 'Hodnoceni oponenta 2024/2025',  1, 'opponent',   NOW());
SQL

# ── Scale set scales ──────────────────────────────────────────────────────────
$PSQL << 'SQL'
INSERT INTO public.scale_set_scales (scale_set_id, scale_id, weight, display_order, created_at) VALUES
  (1,1,25,1,NOW()), (1,2,20,2,NOW()), (1,3,20,3,NOW()), (1,4,20,4,NOW()), (1,5,15,5,NOW()),
  (2,1,20,1,NOW()), (2,2,25,2,NOW()), (2,3,20,3,NOW()), (2,4,20,4,NOW()), (2,5,15,5,NOW());
SQL

# ── Grades ────────────────────────────────────────────────────────────────────
# proj 1: Novak(sup)+Dvorak(opp), proj 2: Dvorak(sup)+Kovar(opp),
# proj 3: Kovar(sup)+Novak(opp), proj 5: Dvorak(sup)+Novak(opp)
# proj 4 (draft) intentionally has no grades
echo "Vkladam hodnoceni..."
$PSQL << SQL
INSERT INTO public.grades (value, year_id, project_id, reviewer_id, scale_id, created_at) VALUES
  -- Projekt 1 — supervisor Jan Novak (88% celkove)
  (18, 1, 1, '$TEACHER1_UUID', 1, NOW() - INTERVAL '3 days'),
  (16, 1, 1, '$TEACHER1_UUID', 2, NOW() - INTERVAL '3 days'),
  (17, 1, 1, '$TEACHER1_UUID', 3, NOW() - INTERVAL '3 days'),
  (18, 1, 1, '$TEACHER1_UUID', 4, NOW() - INTERVAL '3 days'),
  (19, 1, 1, '$TEACHER1_UUID', 5, NOW() - INTERVAL '3 days'),
  -- Projekt 1 — opponent Petra Dvorak
  (16, 1, 1, '$TEACHER2_UUID', 1, NOW() - INTERVAL '2 days'),
  (17, 1, 1, '$TEACHER2_UUID', 2, NOW() - INTERVAL '2 days'),
  (15, 1, 1, '$TEACHER2_UUID', 3, NOW() - INTERVAL '2 days'),
  (17, 1, 1, '$TEACHER2_UUID', 4, NOW() - INTERVAL '2 days'),
  (18, 1, 1, '$TEACHER2_UUID', 5, NOW() - INTERVAL '2 days'),
  -- Projekt 2 — supervisor Petra Dvorak
  (17, 1, 2, '$TEACHER2_UUID', 1, NOW() - INTERVAL '6 days'),
  (18, 1, 2, '$TEACHER2_UUID', 2, NOW() - INTERVAL '6 days'),
  (16, 1, 2, '$TEACHER2_UUID', 3, NOW() - INTERVAL '6 days'),
  (17, 1, 2, '$TEACHER2_UUID', 4, NOW() - INTERVAL '6 days'),
  (18, 1, 2, '$TEACHER2_UUID', 5, NOW() - INTERVAL '6 days'),
  -- Projekt 2 — opponent Martin Kovar
  (15, 1, 2, '$TEACHER3_UUID', 1, NOW() - INTERVAL '4 days'),
  (17, 1, 2, '$TEACHER3_UUID', 2, NOW() - INTERVAL '4 days'),
  (16, 1, 2, '$TEACHER3_UUID', 3, NOW() - INTERVAL '4 days'),
  (14, 1, 2, '$TEACHER3_UUID', 4, NOW() - INTERVAL '4 days'),
  (16, 1, 2, '$TEACHER3_UUID', 5, NOW() - INTERVAL '4 days'),
  -- Projekt 3 — supervisor Martin Kovar
  (16, 1, 3, '$TEACHER3_UUID', 1, NOW() - INTERVAL '9 days'),
  (15, 1, 3, '$TEACHER3_UUID', 2, NOW() - INTERVAL '9 days'),
  (17, 1, 3, '$TEACHER3_UUID', 3, NOW() - INTERVAL '9 days'),
  (16, 1, 3, '$TEACHER3_UUID', 4, NOW() - INTERVAL '9 days'),
  (17, 1, 3, '$TEACHER3_UUID', 5, NOW() - INTERVAL '9 days'),
  -- Projekt 3 — opponent Jan Novak
  (14, 1, 3, '$TEACHER1_UUID', 1, NOW() - INTERVAL '7 days'),
  (15, 1, 3, '$TEACHER1_UUID', 2, NOW() - INTERVAL '7 days'),
  (13, 1, 3, '$TEACHER1_UUID', 3, NOW() - INTERVAL '7 days'),
  (15, 1, 3, '$TEACHER1_UUID', 4, NOW() - INTERVAL '7 days'),
  (14, 1, 3, '$TEACHER1_UUID', 5, NOW() - INTERVAL '7 days'),
  -- Projekt 5 — supervisor Petra Dvorak (vynikajici)
  (19, 1, 5, '$TEACHER2_UUID', 1, NOW() - INTERVAL '5 days'),
  (18, 1, 5, '$TEACHER2_UUID', 2, NOW() - INTERVAL '5 days'),
  (17, 1, 5, '$TEACHER2_UUID', 3, NOW() - INTERVAL '5 days'),
  (19, 1, 5, '$TEACHER2_UUID', 4, NOW() - INTERVAL '5 days'),
  (20, 1, 5, '$TEACHER2_UUID', 5, NOW() - INTERVAL '5 days'),
  -- Projekt 5 — opponent Jan Novak
  (17, 1, 5, '$TEACHER1_UUID', 1, NOW() - INTERVAL '4 days'),
  (18, 1, 5, '$TEACHER1_UUID', 2, NOW() - INTERVAL '4 days'),
  (16, 1, 5, '$TEACHER1_UUID', 3, NOW() - INTERVAL '4 days'),
  (17, 1, 5, '$TEACHER1_UUID', 4, NOW() - INTERVAL '4 days'),
  (18, 1, 5, '$TEACHER1_UUID', 5, NOW() - INTERVAL '4 days');
SQL

# ── Reviews / posudky ─────────────────────────────────────────────────────────
echo "Vkladam posudky..."
$PSQL << SQL
INSERT INTO public.reviews (project_id, reviewer_id, comments, submitted_at, updated_at) VALUES
  -- Projekt 1
  (1, '$TEACHER1_UUID',
   'Studentka Eva Svobodova splnila zadani vyborne. Implementace je technicke zdatna a dobre strukturovana. Oceňuji zejmena kvalitu API vrstvy a prehlednost frontend kodu. Dokumentace je kompletni a srozumitelna. Doporucuji praci k obhajobe s hodnocenim vyborne.',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  (1, '$TEACHER2_UUID',
   'Prace prinasi funkcni reseni pro realny problem akademicke spravy. Technicke zpracovani je na dobre urovni. Oceňuji prehledny uzivatelsky interface a promysleny datovy model. Otazka k obhajobe: jak system zvladne skalovatelnost pri vetsim poctu uzivatelu?',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  -- Projekt 2
  (2, '$TEACHER2_UUID',
   'Student Tomas Horak prokazal hlubokou znalost algoritmu strojoveho uceni a jejich aplikaci v oblasti sitove bezpecnosti. Implementovany system dosahuje vynikajicich vysledku — presnost 93,4 % prekracuje stanoveny cil. Oceňuji systematicky pristup k experimentovani a kvalitni dokumentaci metodiky. Doporucuji k obhajobe s hodnocenim chvalitebne.',
   NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  (2, '$TEACHER3_UUID',
   'Prace ma silne teoreticke zazemeni a solidni implementaci. Datova sada je rozsahla a reprezentativni. Doporucuji doplnit srovnani s komercinimi nastroji (Snort, Suricata). Otazka k obhajobe: jaka je latence detekce v prostredi s 10 Gbit/s propustnosti sity?',
   NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  -- Projekt 3
  (3, '$TEACHER3_UUID',
   'Lucie Novakova zpracovala tema agilniho managementu s dukladnym prehledem odborne literatury. Aplikace je plne funkcni a pokryva vsechny klicove aspekty metodiky Scrum. Oceňuji integraci s externimi nastroji a duraz na uzivatelsky zazne. Prace je pripravena k obhajobe.',
   NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
  (3, '$TEACHER1_UUID',
   'Zpracovani je korektni a aplikace splnuje stanovene pozadavky. Mene se mi libi absence mobilni verze a omezena podpora Kanban metodiky vedle Scrumu. Doporucuji doplnit sekci o testovani — unit testy pokryvaji pouze 45 % kodu. Otazka: jak jste resili synchronizaci pri soucasnem pristupu vice uzivatelu?',
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  -- Projekt 5
  (5, '$TEACHER2_UUID',
   'Pavel Krejci odvedl vyjimecnou praci v oblasti bezpecnostniho auditu. Metodika odpovidá profesionalnim standardum (OWASP, NIST). Nalezene zranitelnosti jsou presne kategorizovany dle CVSS a doporuceni jsou prakticka a realizovatelna. Tuto praci doporucuji jako vzorovou pro budouci rocniky.',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (5, '$TEACHER1_UUID',
   'Vynikajici prace s realnym dopadem na bezpecnost organizace. Oceňuji odvahu provest skutecny penetracni test a prehledne zdokumentovat vysledky. Executive summary je skvele napsane — pochopitelne i pro netechnicke management. Otazka: jak byste postupoval, pokud byste nasel kriticke CVE behem aktivniho testu produkce?',
   NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');
SQL

# ── External links ────────────────────────────────────────────────────────────
echo "Vkladam externi odkazy..."
$PSQL << 'SQL'
INSERT INTO public.external_links (project_id, url, title, description, added_at, updated_at) VALUES
  -- Projekt 1
  (1, 'https://github.com/example/submitheses',  'GitHub repozitar',    'Zdrojovy kod projektu',            NOW(), NOW()),
  (1, 'https://nextjs.org/docs',                  'Next.js dokumentace', 'Framework pouzity pro frontend',   NOW(), NOW()),
  (1, 'https://www.prisma.io/docs',               'Prisma ORM',          'Databazovy ORM framework',         NOW(), NOW()),
  -- Projekt 2
  (2, 'https://scikit-learn.org',                 'Scikit-learn',        'Knihovna ML algoritmu',            NOW(), NOW()),
  (2, 'https://keras.io',                         'Keras / TensorFlow',  'LSTM autoencoder implementace',    NOW(), NOW()),
  (2, 'https://www.wireshark.org',                'Wireshark',           'Analyza sitovych paketu',          NOW(), NOW()),
  -- Projekt 3
  (3, 'https://agilemanifesto.org',               'Agile Manifesto',     'Principy agilniho vyvoje',         NOW(), NOW()),
  (3, 'https://scrum.org',                        'Scrum Guide',         'Oficialni Scrum dokumentace',      NOW(), NOW()),
  (3, 'https://ant.design',                       'Ant Design',          'UI knihovna pouzita v projektu',   NOW(), NOW()),
  -- Projekt 4
  (4, 'https://flutter.dev/docs',                 'Flutter dokumentace', 'Framework pro mobilni vyvoj',      NOW(), NOW()),
  (4, 'https://scratch.mit.edu',                  'Scratch MIT',         'Vizualni programovani pro zaky',   NOW(), NOW()),
  (4, 'https://firebase.google.com/docs',         'Firebase',            'Backend-as-a-Service platforma',   NOW(), NOW()),
  -- Projekt 5
  (5, 'https://owasp.org/Top10',                  'OWASP Top 10',        'Nejcastejsi webove zranitelnosti', NOW(), NOW()),
  (5, 'https://nvd.nist.gov',                     'NIST NVD',            'Databaze CVE zranitelnosti',       NOW(), NOW()),
  (5, 'https://aws.amazon.com/security',          'AWS Security Hub',    'AWS bezpecnostni smernice',        NOW(), NOW());
SQL

# ── Activity logs ─────────────────────────────────────────────────────────────
echo "Vkladam aktivitu..."
$PSQL << SQL
INSERT INTO public.activity_logs (project_id, user_id, action_type, description, created_at) VALUES
  -- Projekt 1 (public — plny zivotni cyklus)
  (1, '$ADMIN_UUID',    'project_created',    'Projekt byl vytvoren',                               NOW() - INTERVAL '60 days'),
  (1, '$TEACHER1_UUID', 'supervisor_assigned','Vedouci prace Jan Novak byl prirazen',               NOW() - INTERVAL '59 days'),
  (1, '$TEACHER2_UUID', 'opponent_assigned',  'Oponent Petra Dvorak byla prirazena',                NOW() - INTERVAL '58 days'),
  (1, '$STUDENT1_UUID', 'student_assigned',   'Studentka Eva Svobodova byla prirazena k projektu',  NOW() - INTERVAL '45 days'),
  (1, '$STUDENT1_UUID', 'description_updated','Popis projektu a harmonogram vyplneny',              NOW() - INTERVAL '30 days'),
  (1, '$STUDENT1_UUID', 'file_uploaded',      'Priloha nahrana: bakalarska_prace_final.pdf',        NOW() - INTERVAL '10 days'),
  (1, '$TEACHER1_UUID', 'review_submitted',   'Vedouci Jan Novak odeslal posudek',                  NOW() - INTERVAL '3 days'),
  (1, '$TEACHER2_UUID', 'review_submitted',   'Oponent Petra Dvorak odeslala posudek',              NOW() - INTERVAL '2 days'),
  (1, '$ADMIN_UUID',    'status_changed',     'Status projektu zmenen na: public',                  NOW() - INTERVAL '2 days'),
  -- Projekt 2 (locked — hodnoceni probiha)
  (2, '$ADMIN_UUID',    'project_created',    'Projekt byl vytvoren',                               NOW() - INTERVAL '55 days'),
  (2, '$TEACHER2_UUID', 'supervisor_assigned','Vedouci prace Petra Dvorak byla prirazena',          NOW() - INTERVAL '54 days'),
  (2, '$TEACHER3_UUID', 'opponent_assigned',  'Oponent Martin Kovar byl prirazen',                  NOW() - INTERVAL '53 days'),
  (2, '$STUDENT2_UUID', 'student_assigned',   'Student Tomas Horak byl prirazen k projektu',        NOW() - INTERVAL '40 days'),
  (2, '$STUDENT2_UUID', 'description_updated','Popis projektu a harmonogram aktualizovan',          NOW() - INTERVAL '25 days'),
  (2, '$STUDENT2_UUID', 'file_uploaded',      'Priloha nahrana: dp_horak_final.pdf',                NOW() - INTERVAL '7 days'),
  (2, '$TEACHER2_UUID', 'review_submitted',   'Vedouci Petra Dvorak odeslala posudek',              NOW() - INTERVAL '6 days'),
  (2, '$TEACHER3_UUID', 'review_submitted',   'Oponent Martin Kovar odeslal posudek',               NOW() - INTERVAL '4 days'),
  (2, '$ADMIN_UUID',    'status_changed',     'Status projektu zmenen na: locked',                  NOW() - INTERVAL '5 days'),
  -- Projekt 3 (locked — hodnoceni probiha)
  (3, '$ADMIN_UUID',    'project_created',    'Projekt byl vytvoren',                               NOW() - INTERVAL '50 days'),
  (3, '$TEACHER3_UUID', 'supervisor_assigned','Vedouci prace Martin Kovar byl prirazen',            NOW() - INTERVAL '49 days'),
  (3, '$TEACHER1_UUID', 'opponent_assigned',  'Oponent Jan Novak byl prirazen',                     NOW() - INTERVAL '48 days'),
  (3, '$STUDENT3_UUID', 'student_assigned',   'Studentka Lucie Novakova byla prirazena k projektu', NOW() - INTERVAL '35 days'),
  (3, '$STUDENT3_UUID', 'description_updated','Technicka specifikace a harmonogram doplneny',       NOW() - INTERVAL '20 days'),
  (3, '$STUDENT3_UUID', 'file_uploaded',      'Priloha nahrana: bp_novakova_v2.pdf',                NOW() - INTERVAL '9 days'),
  (3, '$TEACHER3_UUID', 'review_submitted',   'Vedouci Martin Kovar odeslal posudek',               NOW() - INTERVAL '9 days'),
  (3, '$TEACHER1_UUID', 'review_submitted',   'Oponent Jan Novak odeslal posudek',                  NOW() - INTERVAL '7 days'),
  (3, '$ADMIN_UUID',    'status_changed',     'Status projektu zmenen na: locked',                  NOW() - INTERVAL '8 days'),
  -- Projekt 4 (draft — probiha)
  (4, '$TEACHER1_UUID', 'project_created',    'Projekt byl vytvoren',                               NOW() - INTERVAL '20 days'),
  (4, '$TEACHER3_UUID', 'opponent_assigned',  'Oponent Martin Kovar byl prirazen',                  NOW() - INTERVAL '18 days'),
  (4, '$STUDENT5_UUID', 'student_assigned',   'Student Ondrej Cerny byl prirazen k projektu',       NOW() - INTERVAL '15 days'),
  (4, '$STUDENT5_UUID', 'description_updated','Zakladni popis projektu a cile vyplneny',            NOW() - INTERVAL '10 days'),
  -- Projekt 5 (public — vyjimecny vysledek)
  (5, '$ADMIN_UUID',    'project_created',    'Projekt byl vytvoren',                               NOW() - INTERVAL '45 days'),
  (5, '$TEACHER2_UUID', 'supervisor_assigned','Vedouci prace Petra Dvorak byla prirazena',          NOW() - INTERVAL '44 days'),
  (5, '$TEACHER1_UUID', 'opponent_assigned',  'Oponent Jan Novak byl prirazen',                     NOW() - INTERVAL '43 days'),
  (5, '$STUDENT4_UUID', 'student_assigned',   'Student Pavel Krejci byl prirazen k projektu',       NOW() - INTERVAL '30 days'),
  (5, '$STUDENT4_UUID', 'description_updated','Metodika auditu a harmonogram doplneny',             NOW() - INTERVAL '20 days'),
  (5, '$STUDENT4_UUID', 'file_uploaded',      'Priloha nahrana: security_audit_report_final.pdf',   NOW() - INTERVAL '6 days'),
  (5, '$TEACHER2_UUID', 'review_submitted',   'Vedouci Petra Dvorak odeslala posudek',              NOW() - INTERVAL '5 days'),
  (5, '$TEACHER1_UUID', 'review_submitted',   'Oponent Jan Novak odeslal posudek',                  NOW() - INTERVAL '4 days'),
  (5, '$ADMIN_UUID',    'status_changed',     'Status projektu zmenen na: public',                  NOW() - INTERVAL '4 days');
SQL

# ── Notifications ─────────────────────────────────────────────────────────────
echo "Vkladam notifikace..."
$PSQL << SQL
INSERT INTO public.notifications (user_id, type, title, message, read, created_at) VALUES
  ('$STUDENT1_UUID', 'grade_available',  'Hodnoceni dostupne',   'Vase zaverecna prace byla ohodnocena. Vysledky jsou v zalozce Hodnoceni.',     false, NOW() - INTERVAL '2 days'),
  ('$STUDENT2_UUID', 'project_locked',   'Projekt uzamcen',      'Vas projekt byl uzamcen pro hodnoceni. Zkontrolujte nahrane prilohy.',          false, NOW() - INTERVAL '5 days'),
  ('$STUDENT3_UUID', 'project_locked',   'Projekt uzamcen',      'Vas projekt byl uzamcen pro hodnoceni. Zkontrolujte nahrane prilohy.',          false, NOW() - INTERVAL '8 days'),
  ('$STUDENT4_UUID', 'grade_available',  'Hodnoceni dostupne',   'Vase zaverecna prace byla ohodnocena. Vysledky jsou v zalozce Hodnoceni.',     false, NOW() - INTERVAL '4 days'),
  ('$STUDENT5_UUID', 'project_created',  'Projekt prirazen',     'Byl vam prirazen projekt: Mobilni aplikace pro vyuku zakladu programovani.',    false, NOW() - INTERVAL '15 days'),
  ('$TEACHER1_UUID', 'grading_reminder', 'Pripominka hodnoceni', 'Blizi se termin hodnoceni projektu: Analyza sitoveho provozu.',                 true,  NOW() - INTERVAL '3 days'),
  ('$TEACHER2_UUID', 'grading_reminder', 'Pripominka hodnoceni', 'Blizi se termin odevzdani posudku: Webova aplikace pro spravu projektu.',       true,  NOW() - INTERVAL '8 days'),
  ('$ADMIN_UUID',    'system',           'Demo data pripravena', 'Databaze byla naplnena demo daty pro prezentaci.',                              false, NOW());
SQL

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "========================================================="
echo "  SubmiTheses — Demo data pripravena!"
echo "========================================================="
echo ""
echo "PRIHLASOVACI UDAJE:"
echo ""
echo "  [ADMIN]"
echo "  admin@demo.cz         /  Admin1234!"
echo ""
echo "  [UCITELE]"
echo "  novak@demo.cz         /  Teacher1234!  (Jan Novak    — vedouci 1,4 / oponent 3,5)"
echo "  dvorak@demo.cz        /  Teacher1234!  (Petra Dvorak — vedouci 2,5 / oponent 1)"
echo "  kovar@demo.cz         /  Teacher1234!  (Martin Kovar — vedouci 3   / oponent 2,4)"
echo ""
echo "  [STUDENTI]"
echo "  svobodova@demo.cz     /  Student1234!  (Eva Svobodova  — projekt 1 PUBLIC  + hodnoceni)"
echo "  horak@demo.cz         /  Student1234!  (Tomas Horak    — projekt 2 LOCKED  + hodnoceni)"
echo "  novakova@demo.cz      /  Student1234!  (Lucie Novakova — projekt 3 LOCKED  + hodnoceni)"
echo "  krejci@demo.cz        /  Student1234!  (Pavel Krejci   — projekt 5 PUBLIC  + hodnoceni)"
echo "  cerny@demo.cz         /  Student1234!  (Ondrej Cerny   — projekt 4 DRAFT   in progress)"
echo ""
echo "========================================================="
echo ""
echo "DEMO SCENARE:"
echo "  - Admin:      vsechny projekty + admin panel (subjekty, roky)"
echo "  - svobodova:  projekt 1 (PUBLIC) — vidi plne hodnoceni od obou recenzentu"
echo "  - krejci:     projekt 5 (PUBLIC) — vidi plne hodnoceni, vynikajici vysledek"
echo "  - horak:      projekt 2 (LOCKED) — hodnoceni pred zverejnenim"
echo "  - novakova:   projekt 3 (LOCKED) — hodnoceni pred zverejnenim"
echo "  - cerny:      projekt 4 (DRAFT)  — prace probiha, bez hodnoceni"
echo "  - novak:      role ucitele — vidi sve projekty jako vedouci a oponent"
echo ""
