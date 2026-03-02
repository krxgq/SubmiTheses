
#show figure: set block(breakable: true)
#set page(
  paper: "a4",
  margin: (x: 2.5cm, top: 3cm, bottom: 3cm),
)
#set text(
  font: "Liberation Serif",
  size: 12pt,
  lang: "cs",
)
#set par(
  leading: 1.2em,  
  justify: true,
  spacing: 1em,
)
#set heading(numbering: "1.1")


#let page-counter = counter("main-pages")


#page(numbering: none)[
  #set text(font: "Montserrat") 

  #align(center)[
    #text(size: 14pt)[
      DELTA – Střední škola informatiky a ekonomie, s.r.o. \
      Ke Kamenci 151, Pardubice
    ]

    #v(5cm)

    #text(size: 24pt, weight: "bold", fill: blue)[
      SubmiTheses
    ]

    #text(size: 14pt)[
      Systém pro správu a odevzdávání maturitních prací
    ]
  ]

  #v(1fr)

  #align(left + bottom)[
    #text(size: 12pt)[
      Bohdan Bodnarchuk \
      4.A \
      Informační technologie \
      \
      2025/2026
    ]
  ]
]


#page(numbering: none, margin: 0pt)[
  #image("zadani.pdf", page: 1, width: 100%, height: 100%)
]
#page(numbering: none, margin: 0pt)[
  #image("zadani.pdf", page: 2, width: 100%, height: 100%)
]
#page(numbering: none, margin: 0pt)[
  #image("zadani.pdf", page: 3, width: 100%, height: 100%)
]


#page(numbering: none)[
  #v(1fr)

  Prohlašuji, že jsem maturitní projekt vypracoval(a) samostatně, výhradně s použitím uvedené literatury.

  #v(2cm)

  V Pardubicích dne ............

  #v(1cm)

  #align(right)[
    ........................................\
    _podpis autora_
  ]

  #v(1fr)
]


#page(numbering: none)[
  #v(1fr)

  Rád bych poděkoval ... za ...

  #v(1fr)
]


#page(numbering: none)[
  #heading(outlined: false, numbering: none)[Resumé]

  Práce se zabývá vývojem webového informačního systému pro správu a odevzdávání maturitních projektů. Systém umožňuje studentům nahrávat práce, učitelům je hodnotit pomocí konfigurovatelných škál a administrátorům spravovat uživatele, předměty a ročníky. Backend je postaven na Node.js s Express a PostgreSQL, frontend využívá Next.js s React.

  #v(0.5cm)

  *Klíčová slova:* webová aplikace, informační systém, maturitní projekt, Next.js, Express.js, PostgreSQL, hodnocení, správa dokumentů

  #v(1cm)

  #heading(outlined: false, numbering: none)[Abstract]

  This thesis focuses on the development of a web-based information system for managing and submitting graduation projects. The system allows students to upload their work, teachers to evaluate submissions using configurable grading scales, and administrators to manage users, subjects, and academic years. The backend is built on Node.js with Express and PostgreSQL, while the frontend utilizes Next.js with React.

  #v(0.5cm)

  *Keywords:* web application, information system, graduation project, Next.js, Express.js, PostgreSQL, grading, document management
]


#page(numbering: none)[
  #heading(outlined: false, numbering: none)[Obsah]
  #outline(
    title: none,
    indent: 2em,
    depth: 3,
  )
]


#set page(
  numbering: "1",
)
#counter(page).update(7)


= Úvod
\
V dnešní době naše škola nemá jednotné řešení pro správu celého životního cyklu maturitních projektů. Celý proces – od výběru tématu přes průběžné konzultace až po finální odevzdání a hodnocení – probíhá nekoordinovaně prostřednictvím různých nástrojů: e-mailů, sdílených složek a papírových formulářů. Tento přístup je náchylný k chybám, nepřehledný a časově náročný pro všechny zúčastněné strany.

Cílem této práce je vytvořit webový informační systém SubmiTheses, který tento problém řeší komplexním způsobem.

*Studenti* se mohou přihlásit k tématu ze seznamu volných prací, odevzdávat a spravovat přílohy svého projektu a sledovat stav hodnocení.

*Vedoucí prací* mohou snadno vytvářet a upravovat témata maturitních projektů, přiřazovat vybrané studenty ze seznamu zájemců, průběžně sledovat vývoj projektu a hodnotit odevzdané práce pomocí konfigurovatelných hodnotících škál.

*Administrátoři* mají plnou kontrolu nad celým systémem – mohou spravovat uživatelské účty, akademické roky, předměty, hodnotící škály a také přímo upravovat či spravovat jednotlivé projekty.

Systém tak centralizuje veškerou komunikaci a dokumentaci na jednom místě, čímž zvyšuje přehlednost, snižuje administrativní zátěž a minimalizuje riziko ztráty důležitých souborů či informací.



= Teoretická část

== Existující řešení

Na trhu existuje několik systémů, které částečně pokrývají problematiku správy studentských prací:

- *Moodle* je komplexní systém pro řízení výuky (LMS), který umožňuje odevzdávání úkolů a hodnocení. Jedná se však o obecný nástroj, který není specializovaný na správu maturitních projektů a jejich životního cyklu. Konfigurace pro tento účel by byla složitá a nepřehledná.

- *Google Classroom* nabízí jednoduché rozhraní pro zadávání a odevzdávání úkolů, ale postrádá pokročilé funkce jako konfigurovatelné hodnotící škály, správu témat projektů či přiřazování studentů k vedoucím.

- *GitHub Classroom* je zaměřen především na programátorské úkoly a správu kódu. Není vhodný pro komplexní správu dokumentace a hodnocení maturitních prací.

- *Microsoft Teams* poskytuje komunikační platformu s možností sdílení souborů a týmové spolupráce. Chybí mu však specializované funkce pro správu životního cyklu projektů, konfigurovatelné hodnotící škály a přehledné zobrazení stavu jednotlivých prací.

- *Ruční proces* pomocí e-mailů a sdílených složek je náchylný k chybám, nepřehledný a neumožňuje centrální sledování stavu projektů.

Žádné z existujících řešení plně nepokrývá specifické potřeby naší školy – proto vznikl systém SubmiTheses.

== Použité technologie

Pro vývoj systému byly zvoleny následující technologie:

- *Next.js* – moderní React framework s podporou server-side renderingu, což zlepšuje výkon a SEO. Využívá souborový systém pro routování, což zjednodušuje strukturu projektu.

- *Express.js* – minimalistický a flexibilní Node.js framework pro tvorbu REST API. Umožňuje rychlý vývoj a snadnou integraci middleware.

- *PostgreSQL* – relační databáze vhodná pro strukturovaná data s vazbami (uživatelé, projekty, hodnocení). Zajišťuje konzistenci dat díky ACID vlastnostem.

- *Prisma ORM* – typově bezpečný objektově-relační mapovač, který zjednodušuje práci s databází a poskytuje automatické migrace schématu.

- *AWS S3* – cloudové úložiště pro přílohy projektů. Zajišťuje škálovatelnost a spolehlivost ukládání souborů.

- *Redis* – in-memory databáze využívaná pro cachování často používaných dat a jako message broker pro frontu úloh BullMQ.

- *BullMQ* – knihovna pro zpracování úloh na pozadí postavená na Redis. Zajišťuje spolehlivé plánování a provádění časově závislých operací (připomenutí termínů, automatické zamykání projektů).

- *Autentizace a bezpečnost* – systém využívá JWT tokeny pro autentizaci uživatelů a bcrypt pro bezpečné hashování hesel.

Pro stylování uživatelského rozhraní je využit *Tailwind CSS* s komponentovou knihovnou *Flowbite*. Lokalizace aplikace je zajištěna knihovnou *next-intl*, validace vstupních dat probíhá pomocí *Zod* a e-mailové notifikace jsou odesílány přes *nodemailer*.



= Metodika a vlastní řešení


== Architektura systému

Systém SubmiTheses je navržen jako monorepo obsahující dvě hlavní části – frontend a backend – které spolu komunikují prostřednictvím REST API.

*Frontend* je postaven na frameworku Next.js a zajišťuje uživatelské rozhraní aplikace. Komunikuje s backendem pomocí HTTP požadavků, přičemž každý požadavek obsahuje JWT token v hlavičce pro autentizaci uživatele.

*Backend* využívá Express.js a zpracovává veškerou aplikační logiku. Pro přístup k databázi PostgreSQL používá Prisma ORM, který zajišťuje typově bezpečnou práci s daty a automatické migrace schématu. Pro optimalizaci výkonu je implementována cache pomocí Redis, která ukládá často používaná data.

*Ukládání souborů* je řešeno prostřednictvím cloudového úložiště AWS S3. Backend generuje pre-signed URL adresy, které umožňují frontendu nahrávat soubory přímo do S3 bez nutnosti průchodu dat přes server. Tento přístup snižuje zatížení backendu a zrychluje nahrávání velkých souborů.

*Fronta úloh* pro zpracování na pozadí využívá knihovnu BullMQ s Redis jako brokerem. Systém automaticky plánuje připomenutí blížících se termínů a zamykání projektů po uplynutí deadlinu. Konfigurovatelné dny připomenutí (výchozí 7, 3 a 1 den před termínem) jsou nastavitelné pro každý akademický rok.

*Autentizace* je zajištěna pomocí Auth Middleware, který ověřuje JWT tokeny a kontroluje oprávnění uživatelů před zpracováním požadavků. Celková architektura systému je znázorněna na @fig:architecture.

#figure(
  image("./architecture.drawio.png", width: 90%),
  caption: [Schéma architektury]
) <fig:architecture>

== Datový model

Databáze systému je postavena na PostgreSQL a obsahuje následující hlavní entity:

*Uživatelé (users)* – centrální entita pro správu účtů. Každý uživatel má přiřazenou roli (admin, teacher, student), kontaktní údaje a volitelně odkaz na akademický rok. Studenti mají navíc atribut třídy.

*Projekty (projects)* – hlavní entita reprezentující maturitní práci. Obsahuje název, popis, stav (draft, locked, public) a vazby na studenta, vedoucího a oponenta. Projekt může být uzamčen pro úpravy s uvedením důvodu a času uzamčení.

*Popis projektu (project\_descriptions)* – rozšiřující entita v relaci 1:1 s projektem. Obsahuje detailní specifikaci práce: téma, cíl, harmonogram, požadované výstupy a kritéria hodnocení.

*Akademické roky (years)* – definuje školní rok s klíčovými termíny: datum zadání, odevzdání a zpětné vazby. Projekty a uživatelé jsou přiřazeni k roku.

*Předměty (subjects)* – obory studia, ke kterým jsou projekty přiřazeny.

*Hodnocení (grades)* – jednotlivá hodnocení projektů od hodnotitelů. Každé hodnocení odkazuje na hodnotící škálu a obsahuje číselnou hodnotu.

*Hodnotící škály (scales)* – definice kritérií hodnocení s maximální hodnotou a popisem. Škály jsou seskupeny do sad (scale\_sets) s vahou a pořadím zobrazení.

*Sady škál (scale\_sets)* – konfigurovatelné sady hodnotících kritérií pro různé role (vedoucí, oponent). Umožňují flexibilní nastavení hodnocení pro každý akademický rok.

*Přílohy (attachments)* – soubory nahrané k projektu. Ukládají se metadata (název, cesta v S3, popis), samotné soubory jsou v cloudovém úložišti.

*Externí odkazy (external\_links)* – URL odkazy na externí zdroje projektu (repozitář, dokumentace, demo).

*Posudky (reviews)* – textové posudky od vedoucího a oponenta k projektům.

*Přihlášky studentů (project\_signups)* – záznam zájmu studentů o volná témata. Každý student se může přihlásit k více projektům, ale vedoucí vybírá jednoho zájemce. Po přiřazení studenta se ostatní přihlášky automaticky odstraní.

*Oznámení (notifications)* – systémová oznámení pro uživatele. Každé oznámení má typ (přiřazení projektu, odevzdání hodnocení, připomenutí termínu apod.), titulek, zprávu, stav přečtení a volitelná metadata ve formátu JSON.

*Protokol aktivit (activity\_logs)* – záznam všech akcí provedených na projektech pro auditní účely. Vztahy mezi entitami jsou znázorněny na @fig:er-diagram.

#figure(
  image("./er-diagram.png", width: 100%),
  caption: [ER diagram datového modelu]
) <fig:er-diagram>

== Návrh uživatelského rozhraní

Uživatelské rozhraní systému SubmiTheses je navrženo jako responzivní webová aplikace s důrazem na přehlednost a přizpůsobení obsahu podle role přihlášeného uživatele.

=== Principy návrhu

Při návrhu rozhraní byly zvoleny následující principy:

- *Responzivní layout* – aplikace se přizpůsobuje šířce obrazovky od mobilních zařízení (320 px) po velké monitory. Využívá tři hlavní breakpointy: 640 px, 768 px a 1024 px.

- *Role-based navigace* – obsah postranního panelu a dostupné akce se dynamicky mění podle role uživatele (admin, učitel, student). Například studenti nevidí sekci správy uživatelů ani administrátorský panel.

- *Podpora tmavého režimu* – uživatel si může zvolit světlý, tmavý nebo systémový režim. Barvy jsou definovány pomocí CSS proměnných s vlastním sémantickým tokenovým systémem (primary, danger, warning, success), což zajišťuje konzistentní vzhled v obou režimech.

- *Dvojjazyčnost* – celé rozhraní je lokalizováno do češtiny a angličtiny pomocí knihovny next-intl. Každá URL adresa obsahuje prefix jazyka (např. `/en/projects`, `/cz/projects`).

=== Struktura rozložení

Aplikace využívá klasické rozložení dashboardu se dvěma hlavními oblastmi:

- *Postranní panel (sidebar)* – pevná šířka 256 px, obsahuje logo, navigační menu, přepínač motivu, přepínač jazyka a uživatelské menu s odhlášením. Na mobilních zařízeních se panel skrývá a zobrazuje se pomocí hamburger ikony.

- *Hlavní oblast* – zabírá zbývající šířku, obsahuje navigační drobečky (breadcrumbs) a samotný obsah stránky s maximální šířkou 1400 px.

// TODO: Screenshot celkového rozložení aplikace (sidebar + hlavní obsah)
// #figure(
//   image("./screenshots/layout.png", width: 90%),
//   caption: [Celkové rozložení aplikace s postranním panelem]
// ) <fig:ui-layout>

=== Navigace podle rolí

Postranní panel zobrazuje položky navigace v závislosti na roli uživatele:

#figure(
  table(
    columns: (1fr, auto, auto, auto),
    inset: 6pt,
    align: (left, center, center, center),
    table.header([*Položka*], [*Admin*], [*Učitel*], [*Student*]),
    [Projekty], [✓], [✓], [✓],
    [Oznámení], [✓], [✓], [✓],
    [Uživatelé], [✓], [–], [–],
    [Nastavení], [✓], [✓], [✓],
    [Admin panel], [✓], [–], [–],
  ),
  caption: [Viditelnost navigačních položek podle role]
) <fig:nav-roles>

U položky Oznámení se zobrazuje červený indikátor nepřečtených zpráv, který se automaticky aktualizuje každých 60 sekund.

=== Klíčové obrazovky

==== Seznam projektů

Hlavní stránka zobrazuje projekty rozdělené do sekcí podle vztahu uživatele k projektu: Moje projekty, Jako vedoucí, Jako oponent a Ostatní projekty. Uživatel si může přepínat mezi zobrazením v mřížce a seznamu.

Mřížka využívá responzivní rozložení – 1 sloupec na mobilu, 2 na tabletu a 3 na desktopu.

// TODO: Screenshot seznamu projektů v mřížkovém zobrazení
// #figure(
//   image("./screenshots/projects-list.png", width: 90%),
//   caption: [Seznam projektů v mřížkovém zobrazení]
// ) <fig:ui-projects>

==== Detail projektu

Stránka detailu projektu využívá dvousloupcové rozložení na desktopu:

- *Levý sloupec (2/3 šířky)* – přehled projektu (téma, cíl, specifikace, harmonogram, tým) a záložky pro přílohy, externí odkazy a hodnocení.
- *Pravý sloupec (1/3 šířky)* – rychlé statistiky, akční tlačítka (podle role) a nedávná aktivita.

Na mobilních zařízeních se sloupce skládají pod sebe.

// TODO: Screenshot detailu projektu
// #figure(
//   image("./screenshots/project-detail.png", width: 90%),
//   caption: [Detail projektu – dvousloupcové rozložení]
// ) <fig:ui-project-detail>

==== Volná témata

Studenti mají přístup ke stránce s volnými tématy, kde mohou vyjádřit zájem o projekt pomocí tlačítka přihlášení. Vedoucí následně vidí seznam zájemců a může studenta přiřadit.

// TODO: Screenshot stránky s volnými tématy
// #figure(
//   image("./screenshots/available-topics.png", width: 90%),
//   caption: [Stránka volných témat pro studenty]
// ) <fig:ui-available>

==== Hodnocení

Hodnotící formulář zobrazuje škálu kritérií s maximálními hodnotami a váhami. Učitel zadává hodnoty a systém automaticky vypočítá vážený průměr. Studenti vidí výsledky hodnocení až po datu zpětné vazby stanoveném pro akademický rok.

// TODO: Screenshot hodnotícího formuláře
// #figure(
//   image("./screenshots/grading-form.png", width: 90%),
//   caption: [Formulář pro hodnocení projektu]
// ) <fig:ui-grading>

==== Oznámení

Stránka oznámení zobrazuje seznam notifikací s možností filtrování (všechny / nepřečtené). Nepřečtené zprávy jsou zvýrazněny barevným pruhem na levé straně. Uživatel může označit jednotlivé zprávy nebo všechny najednou jako přečtené.

// TODO: Screenshot stránky s oznámeními
// #figure(
//   image("./screenshots/notifications.png", width: 90%),
//   caption: [Stránka oznámení s filtrováním]
// ) <fig:ui-notifications>

==== Administrátorský panel

Administrátoři mají přístup k panelu s horizontální záložkovou navigací pro správu předmětů, škál, sad škál a akademických roků. Každá záložka obsahuje datovou tabulku s akcemi pro vytvoření, úpravu a smazání záznamů.

// TODO: Screenshot admin panelu
// #figure(
//   image("./screenshots/admin-panel.png", width: 90%),
//   caption: [Administrátorský panel se záložkovou navigací]
// ) <fig:ui-admin>

=== Responzivní chování

Aplikace se přizpůsobuje třem hlavním rozlišením:

#figure(
  table(
    columns: (auto, 1fr),
    inset: 6pt,
    align: (left, left),
    table.header([*Rozlišení*], [*Chování*]),
    [Mobil (< 640 px)], [Sidebar skrytý za hamburger ikonou, jednoslovpcový layout, zmenšené odsazení],
    [Tablet (768 px+)], [Mřížka projektů ve 2 sloupcích, viditelná jména uživatelů],
    [Desktop (1024 px+)], [Sidebar vždy viditelný, 3 sloupce mřížky, dvousloupcový detail projektu, plné odsazení],
  ),
  caption: [Responzivní chování aplikace]
) <fig:responsive>


== Implementace


=== Backendová část

==== Struktura složek

Zdrojový kód backendu je organizován v adresáři `backend/src/` do následujících složek:

- `controllers/` – zpracování HTTP požadavků a volání příslušných služeb. Každý controller odpovídá jedné doménové oblasti (projekty, uživatelé, oznámení apod.).
- `services/` – hlavní aplikační logika oddělená od HTTP vrstvy. Služby obsahují veškerou business logiku a komunikaci s databází přes Prisma ORM.
- `routes/` – definice API tras a napojení na controllery s příslušnými middleware.
- `middleware/` – autentizační a autorizační middleware pro ověření JWT tokenů a kontrolu rolí.
- `validation/` – validační schémata pro ověření vstupních dat pomocí knihovny Zod.
- `queues/` – definice front pro zpracování úloh na pozadí (BullMQ).
- `workers/` – workery zpracovávající úlohy z front (připomenutí termínů, zamykání projektů).
- `config/` – konfigurace aplikace (databáze, S3, Redis, JWT).
- `lib/` – inicializace sdílených knihoven (Prisma klient, Redis připojení).
- `templates/` – šablony pro e-mailové notifikace.
- `types/` – TypeScript typy specifické pro backend.
- `utils/` – pomocné funkce (formátování dat, generování tokenů apod.).

Tato struktura sleduje princip oddělení odpovědností – HTTP vrstva (controllers/routes) je oddělena od business logiky (services), což usnadňuje testování a údržbu kódu.

==== Fronta úloh a plánování termínů

Projekty v systému mají pevně stanovené termíny odevzdání definované v rámci akademického roku. Pro zajištění automatického připomínání blížících se termínů a zamykání projektů po uplynutí deadlinu byl implementován systém zpracování úloh na pozadí pomocí knihovny BullMQ s Redis jako brokerem zpráv.

Systém využívá jednu frontu s názvem `deadlines`, která zpracovává dva typy úloh:

- *reminder* – odešle notifikaci studentovi N dní před termínem odevzdání. Dny připomenutí jsou konfigurovatelné pro každý akademický rok (výchozí hodnoty: 7, 3 a 1 den před termínem). Každé připomenutí je idempotentní – systém si v poli `reminders_sent` u projektu ukládá, která připomenutí již byla odeslána, a duplicitní odeslání přeskočí.

- *lock* – automaticky uzamkne projekt v přesný okamžik deadlinu. Při zamčení se změní stav projektu na `locked`, zaloguje se aktivita a všichni účastníci projektu (student, vedoucí, oponent) obdrží notifikaci.

*Plánování úloh* probíhá ve třech situacích: při vytvoření projektu (pokud má přiřazeného studenta a akademický rok), při přiřazení studenta k projektu a při změně termínu v akademickém roce. Při změně termínu se existující naplánované úlohy nejprve zruší a poté se naplánují nové odpovídající novému deadlinu.

Pro zajištění spolehlivosti jsou úlohy konfigurovány s 3 opakovanými pokusy při selhání s exponenciálním navyšováním prodlevy (počáteční prodleva 1 minuta). Worker zpracovává až 5 úloh souběžně. Před zpracováním každé úlohy se kontroluje, zda projekt stále existuje, není již zamčen a má přiřazeného studenta.

Pro monitoring fronty je k dispozici administrátorské rozhraní Bull Board dostupné na cestě `/admin/queues`, které zobrazuje stav naplánovaných, probíhajících a dokončených úloh.

=== Frontendová část

==== Struktura aplikace a routování

Frontend využívá App Router frameworku Next.js s dynamickým segmentem `[locale]` v cestě, který zajišťuje lokalizaci všech URL adres (např. `/en/projects`, `/cz/projects`). Podporovány jsou dva jazyky – čeština a angličtina – s angličtinou jako výchozím jazykem.

Stránky jsou organizovány do dvou skupin tras (route groups):

- *(dashboard)* – chráněné stránky pro přihlášené uživatele, které sdílejí společný layout s postranním panelem a navigací.
- *(auth)* – veřejné stránky pro přihlášení a nastavení hesla z pozvánky, bez postranního panelu.

Lokalizace je implementována pomocí knihovny next-intl. Překlady jsou uloženy v JSON souborech (`locales/en/common.json`, `locales/cz/common.json`) a načítány dynamicky podle aktuálního jazyka. V serverových komponentách se používá funkce `getMessages()`, v klientských komponentách hook `useTranslations()`.

==== Autentizace a řízení přístupu

Ověření identity uživatele probíhá na úrovni Next.js middleware. Middleware ověřuje podpis JWT tokenu pomocí knihovny `jose` přímo na straně frontendu – bez nutnosti volat backend. Tento přístup eliminuje síťovou latenci při kontrole autentizace a umožňuje rychlé rozhodnutí o přístupu ke stránce.

Z JWT payloadu se extrahuje role uživatele a nastaví se do HTTP hlavičky `x-current-role`, kterou následně čte dashboard layout pro vykreslení navigace a obsahu odpovídajícího dané roli. Nepřihlášení uživatelé jsou přesměrováni na přihlašovací stránku, přihlášení uživatelé na stránce `/auth` jsou přesměrováni na seznam projektů.

Řízení přístupu k jednotlivým trasám je definováno v centrálním konfiguračním souboru, kde každá trasa specifikuje povolené role a volitelně kontrolu vlastnictví zdroje (např. student může editovat pouze svůj vlastní profil). Pokud uživatel nemá oprávnění, middleware provede rewrite na komponentu `AccessDenied` bez změny URL adresy.

Pro synchronizaci stavu přihlášení mezi záložkami prohlížeče je využito BroadcastChannel API – odhlášení v jedné záložce se okamžitě projeví ve všech ostatních.

==== Komunikace s backendem

Veškerá komunikace s REST API probíhá přes univerzální funkci `apiRequest<T>()`, která funguje jak v serverových, tak v klientských komponentách. Na straně serveru funkce ručně čte cookies z požadavku a předává je v hlavičce, na straně klienta využívá `credentials: 'include'` pro automatické odesílání cookies.

API volání jsou organizována do modulů podle domény (projekty, uživatelé, oznámení, hodnocení, přílohy apod.), přičemž každý modul exportuje typované funkce. Typy dat jsou sdíleny mezi frontendem a backendem prostřednictvím workspace balíčku `@sumbi/shared-types`, což zajišťuje konzistenci datových struktur na obou stranách.

Pro operace na klientské straně je k dispozici hook `useApi()`, který zapouzdřuje stav načítání, chybový stav a data do jednoduchého rozhraní s manuálním spuštěním přes funkci `execute()`.

==== Oznámení a polling

Systém oznámení na frontendu využívá pravidelné dotazování (polling) s intervalem 60 sekund. Postranní panel zobrazuje červený indikátor u ikony oznámení, pokud existují nepřečtená oznámení. Stránka oznámení podporuje filtrování (všechna / nepřečtená), stránkování a hromadné označení jako přečtené.


= Dokumentace API

Backend poskytuje REST API pro komunikaci s frontendem. Všechny endpointy kromě přihlášení vyžadují autentizaci, některé operace jsou omezeny na konkrétní role (viz @fig:api-endpoints).

== Autentizace

Pro ověření identity uživatelů systém využívá JWT (JSON Web Token). Při přihlášení server ověří e-mail a heslo (hashované algoritmem bcrypt) a vygeneruje dva tokeny:

- *Access token* – platnost 1 hodina, slouží k autorizaci požadavků
- *Refresh token* – platnost 7–30 dní, slouží k obnovení access tokenu

Tokeny jsou uloženy v httpOnly cookies, což chrání před XSS útoky – JavaScript v prohlížeči k nim nemá přístup.

== Přehled endpointů

#figure(
  table(
    columns: (auto, 1fr, auto),
    inset: 6pt,
    align: (left, left, center),
    table.header([*Endpoint*], [*Popis*], [*Oprávnění*]),

    table.cell(colspan: 3, fill: luma(230))[*Projekty*],
    [GET /projects], [Seznam všech projektů], [všichni],
    [GET /projects/:id], [Detail projektu], [všichni],
    [POST /projects], [Vytvoření nového projektu], [učitel],
    [PUT /projects/:id], [Úprava projektu], [vlastník],
    [DELETE /projects/:id], [Smazání projektu], [vlastník],
    [PUT /projects/:id/status], [Změna stavu (draft/locked/public)], [vlastník],
    [PUT /projects/:id/student], [Přiřazení studenta k projektu], [vedoucí],

    table.cell(colspan: 3, fill: luma(230))[*Přihlašování studentů*],
    [POST /projects/:id/signup], [Přihlášení zájmu o téma], [student],
    [DELETE /projects/:id/signup], [Zrušení přihlášky], [student],
    [GET /projects/:id/signups], [Seznam zájemců o téma], [vedoucí],
    [GET /projects/:id/signup/status], [Stav přihlášky aktuálního studenta], [student],

    table.cell(colspan: 3, fill: luma(230))[*Hodnocení*],
    [GET /projects/:id/grading/scale-set], [Hodnotící škála pro hodnotitele], [hodnotitel],
    [GET /projects/:id/grading/my-grades], [Moje zadané známky], [hodnotitel],
    [POST /projects/:id/grading/submit], [Odeslání hodnocení], [hodnotitel],
    [GET /projects/:id/grading/all], [Všechna hodnocení projektu], [všichni],

    table.cell(colspan: 3, fill: luma(230))[*Přílohy*],
    [GET /projects/:id/attachments], [Seznam příloh projektu], [všichni],
    [POST .../request-upload], [Vyžádání URL pro nahrání souboru], [vlastník],
    [POST .../confirm-upload], [Potvrzení nahrání do S3], [vlastník],
    [GET .../:attachmentId/download-url], [URL pro stažení přílohy], [všichni],
    [DELETE .../:attachmentId], [Smazání přílohy], [vlastník],

    table.cell(colspan: 3, fill: luma(230))[*Posudky*],
    [GET /projects/:id/reviews], [Seznam posudků projektu], [učitel],
    [POST /projects/:id/reviews], [Vytvoření posudku], [učitel],
    [PUT .../reviews/:reviewId], [Úprava posudku], [učitel],
    [DELETE .../reviews/:reviewId], [Smazání posudku], [admin],

    table.cell(colspan: 3, fill: luma(230))[*Externí odkazy*],
    [GET /projects/:id/links], [Seznam externích odkazů], [všichni],
    [POST /projects/:id/links], [Přidání odkazu], [vlastník],
    [PUT .../links/:linkId], [Úprava odkazu], [vlastník],
    [DELETE .../links/:linkId], [Smazání odkazu], [vlastník],

    table.cell(colspan: 3, fill: luma(230))[*Oznámení*],
    [GET /notifications], [Seznam oznámení (s filtrováním)], [vlastní],
    [GET /notifications/unread-count], [Počet nepřečtených oznámení], [vlastní],
    [PUT /notifications/mark-all-read], [Označení všech jako přečtené], [vlastní],
    [PUT /notifications/:id/read], [Označení jednoho jako přečtené], [vlastní],
    [DELETE /notifications/:id], [Smazání oznámení], [vlastní],

    table.cell(colspan: 3, fill: luma(230))[*Uživatelé*],
    [GET /users], [Seznam všech uživatelů], [admin],
    [GET /users/:id], [Detail uživatele], [vlastní],
    [POST /users], [Vytvoření uživatele], [admin],
    [PUT /users/:id], [Úprava profilu], [vlastní],
    [DELETE /users/:id], [Smazání uživatele], [admin],
    [PATCH /users/:id/role], [Změna role uživatele], [admin],
    [GET /users/by-role?role=], [Filtr uživatelů podle role], [všichni],
    [POST /users/:id/resend-invitation], [Opětovné odeslání pozvánky], [admin],

    table.cell(colspan: 3, fill: luma(230))[*Předměty*],
    [GET /subjects], [Seznam aktivních předmětů], [veřejné],
    [GET /subjects/all/list], [Všechny předměty vč. neaktivních], [admin],
    [POST /subjects], [Vytvoření předmětu], [admin],
    [PATCH /subjects/:id], [Úprava předmětu], [admin],
    [DELETE /subjects/:id], [Smazání předmětu], [admin],

    table.cell(colspan: 3, fill: luma(230))[*Akademické roky*],
    [GET /years], [Seznam akademických roků], [všichni],
    [GET /years/current], [Aktuální akademický rok], [všichni],
    [POST /years], [Vytvoření nového roku], [admin],
    [PUT /years/:id], [Úprava roku], [admin],
    [DELETE /years/:id], [Smazání roku], [admin],

    table.cell(colspan: 3, fill: luma(230))[*Sady hodnotících škál*],
    [GET /scale-sets], [Seznam sad škál], [všichni],
    [GET /scale-sets/:id], [Detail sady škál], [všichni],
    [POST /scale-sets], [Vytvoření sady], [admin],
    [PUT /scale-sets/:id], [Úprava sady], [admin],
    [DELETE /scale-sets/:id], [Smazání sady], [admin],
    [POST /scale-sets/:id/scales], [Přidání škály do sady], [admin],
    [DELETE .../scales/:scaleId], [Odebrání škály ze sady], [admin],
    [POST /scale-sets/bulk-clone], [Hromadné klonování sad do nového roku], [admin],

    table.cell(colspan: 3, fill: luma(230))[*Autentizace*],
    [POST /auth/login], [Přihlášení (e-mail + heslo)], [veřejné],
    [POST /auth/logout], [Odhlášení], [všichni],
    [POST /auth/refresh], [Obnovení access tokenu], [všichni],
    [GET /auth/session], [Informace o aktuální relaci], [všichni],
    [GET /auth/user], [Profil přihlášeného uživatele], [všichni],
    [GET /users/validate-invitation], [Ověření pozvánkového tokenu], [veřejné],
    [POST /users/setup-password], [Nastavení hesla z pozvánky], [veřejné],
  ),
  caption: [Přehled API endpointů s popisem]
) <fig:api-endpoints>


= Uživatelská příručka

// TODO: Napsat návod k použití aplikace

== Nasazení na server

Systém SubmiTheses je kontejnerizován pomocí Dockeru, což umožňuje konzistentní nasazení na libovolný server s podporou Docker Engine. Nasazení lze provést manuálně nebo automatizovaně prostřednictvím CI/CD pipeline.

=== Docker konfigurace

Backend aplikace využívá vícefázový (multi-stage) Dockerfile pro optimalizaci velikosti výsledného obrazu:

- *Build fáze* – nainstaluje závislosti, vygeneruje Prisma klienta a zkompiluje TypeScript do JavaScriptu. Jako základní obraz slouží `node:latest` (Alpine varianta).
- *Produkční fáze* – obsahuje pouze produkční závislosti a zkompilovaný kód. Výsledný obraz je výrazně menší než vývojový.

Celá infrastruktura je definována v souboru `docker-compose.prod.yml`, který orchestruje čtyři služby:

#figure(
  table(
    columns: (auto, 1fr, auto),
    inset: 6pt,
    align: (left, left, center),
    table.header([*Služba*], [*Popis*], [*Port*]),
    [PostgreSQL 15], [Relační databáze pro ukládání dat], [5432],
    [Redis 7], [Cache a message broker pro BullMQ fronty], [6379],
    [Backend API], [Express.js server s REST API], [5000],
    [Frontend], [Next.js server (standalone režim)], [3000],
  ),
  caption: [Služby v Docker Compose konfiguraci]
) <fig:docker-services>

Všechny služby mají nakonfigurované health checky, které zajišťují, že se backend spustí až po úspěšné inicializaci databáze a Redis. Data databáze a Redis jsou perzistentní díky Docker volumes.

Pro produkční nasazení je nutné nastavit proměnné prostředí – zejména `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (vygenerované pomocí `openssl rand -base64 64`), připojení k databázi, SMTP server a konfiguraci AWS S3 pro ukládání souborů.

=== Manuální nasazení

Postup manuálního nasazení na server:

+ Naklonovat repozitář: `git clone <repo-url>`
+ Vytvořit soubor `.env` s produkčními proměnnými prostředí
+ Spustit aplikaci: `docker compose -f docker-compose.prod.yml up -d --build`
+ Provést databázové migrace: `docker exec submitheses-backend npx prisma migrate deploy`

Pro aktualizaci aplikace stačí stáhnout nové změny (`git pull`), přestavět obrazy a restartovat služby.

=== CI/CD pomocí GitHub Actions

Pro automatizované nasazení lze využít GitHub Actions workflow, který po každém push do hlavní větve provede:

+ *Build a testy* – zkompiluje kód, spustí validaci typů a testy
+ *Sestavení Docker obrazu* – vytvoří produkční obraz a nahraje ho do container registry (např. GitHub Container Registry)
+ *Nasazení na server* – připojí se k serveru přes SSH a aktualizuje běžící kontejnery

Tento přístup zajišťuje, že na server se dostane pouze kód, který prošel všemi kontrolami, a minimalizuje riziko lidské chyby při manuálním nasazení.

== Použití aplikace
// TODO: Popis práce s aplikací, screenshoty



= Bezpečnost

Bezpečnost webové aplikace je klíčovým aspektem návrhu systému SubmiTheses. Aplikace implementuje vícevrstvou ochranu proti nejčastějším typům útoků definovaným v OWASP Top 10.

== SQL Injection

SQL injection je technika, při které útočník vkládá škodlivý SQL kód do vstupních polí aplikace s cílem manipulovat databázové dotazy. Systém SubmiTheses je proti tomuto útoku chráněn použitím *Prisma ORM*, který automaticky parametrizuje všechny databázové dotazy. To znamená, že uživatelský vstup nikdy není přímo vkládán do SQL řetězce – místo toho je předán jako parametr, čímž je znemožněno jeho interpretování jako SQL příkazu.

== Cross-Site Scripting (XSS)

XSS útoky spočívají ve vložení škodlivého JavaScriptu do webové stránky, který se poté spustí v prohlížeči ostatních uživatelů. Ochrana je zajištěna na několika úrovních:

- *Helmet.js* – middleware, který nastavuje bezpečnostní HTTP hlavičky včetně Content Security Policy (CSP), X-Content-Type-Options, X-Frame-Options a dalších. Tyto hlavičky instruují prohlížeč, aby omezil spouštění neautorizovaných skriptů.
- *httpOnly cookies* – JWT tokeny jsou uloženy v cookies s příznakem `httpOnly`, který zabraňuje přístupu k nim z JavaScriptu. I v případě úspěšného XSS útoku tak útočník nemůže získat autentizační tokeny.
- *SameSite cookies* – atribut `sameSite: 'lax'` omezuje odesílání cookies při požadavcích z jiných domén.

== Cross-Site Request Forgery (CSRF)

CSRF útok nutí přihlášeného uživatele nechtěně provést akci na webové aplikaci. Systém implementuje ochranu pomocí vlastního CSRF middleware, který u všech stavově měnících požadavků (POST, PUT, DELETE, PATCH) na API endpointy vyžaduje přítomnost hlavičky `X-Requested-With: XMLHttpRequest`. Prohlížeče neumožňují cizím webům nastavovat vlastní hlavičky při cross-origin požadavcích, čímž je útok znemožněn.

== Ochrana hesel

Uživatelská hesla jsou hashována algoritmem *bcrypt* s 10 rundami solení. Bcrypt je záměrně pomalý algoritmus navržený pro hashování hesel – i při úniku databáze je zpětné získání hesel výpočetně nereálné. Systém nikdy neukládá hesla v čitelné podobě.

== Rate Limiting

Pro ochranu proti útokům hrubou silou (brute-force) jsou citlivé endpointy chráněny rate limiterem (knihovna `express-rate-limit`):

#figure(
  table(
    columns: (auto, auto, auto),
    inset: 6pt,
    align: (left, center, center),
    table.header([*Endpoint*], [*Limit*], [*Časové okno*]),
    [Přihlášení], [10 pokusů], [15 minut],
    [Registrace], [5 pokusů], [1 hodina],
    [Obnovení tokenu], [30 pokusů], [15 minut],
  ),
  caption: [Konfigurace rate limitingu pro autentizační endpointy]
) <fig:rate-limits>

Po dosažení limitu server vrací chybový kód 429 (Too Many Requests) a uživatel musí vyčkat do uplynutí časového okna.

== Validace vstupních dat

Veškerá vstupní data z HTTP požadavků jsou validována pomocí knihovny *Zod* ještě před zpracováním v aplikační logice. Validační schémata definují přesný formát očekávaných dat – typy, délky řetězců, formáty e-mailů, rozsahy čísel a povolené hodnoty výčtových typů. Nevalidní požadavky jsou okamžitě odmítnuty s chybovým kódem 400 a popisem chyby.

== CORS (Cross-Origin Resource Sharing)

CORS politika omezuje, z jakých domén může frontend komunikovat s backendem. Povolené origin adresy jsou konfigurovány prostřednictvím proměnné prostředí `CORS_ORIGIN`. V produkci je povolen přístup pouze z domény frontendu, čímž se zabraňuje neoprávněným požadavkům z jiných webů.

== Bezpečnost souborů

Nahrávání souborů je zabezpečeno na několika úrovních:

- *Whitelist MIME typů* – povoleny jsou pouze definované typy souborů (PDF, Word, Excel, obrázky, ZIP). Ostatní typy jsou odmítnuty.
- *Omezení velikosti* – přílohy max. 10 MB, profilové obrázky max. 2 MB.
- *Sanitizace názvů* – názvy souborů jsou zpracovány funkcí `path.basename()`, která odstraní cestu a zabrání útokům typu directory traversal.
- *Pre-signed URL* – soubory se nahrávají přímo do AWS S3 přes dočasné URL s platností 5 minut, čímž se zamezuje přímému průchodu souborů přes server.

== Autorizace a řízení přístupu

Systém implementuje role-based access control (RBAC) prostřednictvím sady autorizačních middleware. Každý API endpoint má přiřazeny povolené role (admin, teacher, student) a volitelně kontrolu vlastnictví zdroje – například student může upravovat pouze svůj vlastní profil a projekt. Middleware navíc detekuje zastaralé JWT tokeny porovnáním role v tokenu s aktuální rolí v databázi.


= Výsledky

// TODO: Popsat co bylo vytvořeno/zjištěno
// - Stručně, jasně, bez komentářů
// - Fakty, tabulky, grafy



= Diskuse

// TODO: Napsat diskusi
// - Zdůvodnění zvoleného řešení
// - Porovnání s jinými variantami
// - Co se povedlo, co ne
// - Realizační možnosti výsledků



= Závěr

// TODO: Napsat závěr
// - Celkové hodnocení
// - Splnění cílů ze zadání
// - Možné rozšíření do budoucna




#heading(numbering: none)[Literatura]




#heading(numbering: none)[Seznam obrázků]

// TODO: Vygenerovat automaticky nebo napsat ručně
// Obr. 1: Popis obrázku ..... str. X



#heading(numbering: none)[Seznam tabulek]

// TODO: Vygenerovat automaticky nebo napsat ručně



#heading(numbering: none)[Seznam příloh]

// TODO: Seznam příloh
// Příloha A: Název přílohy



#pagebreak()
#heading(numbering: none)[Přílohy]

