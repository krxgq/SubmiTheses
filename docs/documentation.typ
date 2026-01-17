// =============================================================================
// NASTAVENÍ DOKUMENTU (Document settings)
// =============================================================================
#set page(
  paper: "a4",
  margin: (x: 2.5cm, top: 3cm, bottom: 3cm),
)
#set text(
  font: "Cambria",  // nebo "Computer Modern"
  size: 12pt,
  lang: "cs",
)
#set par(
  leading: 1.2em,  // řádkování 1.2-1.4
  justify: true,
  spacing: 1em,
)
#set heading(numbering: "1.1")

// Počítadlo stránek - začne až od hlavního textu
#let page-counter = counter("main-pages")

// *****************************************************************************
// ÚVODNÍ ČÁST (FRONT MATTER) - nečíslované strany
// *****************************************************************************

// =============================================================================
// TITULNÍ LIST (Title page)
// =============================================================================
#page(numbering: none)[
  #set text(font: "Montserrat")  // Montserrat pro celou titulní stránku

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

// =============================================================================
// ZADÁNÍ MATURITNÍ PRÁCE (Assignment - 3 stránky)
// =============================================================================
#page(numbering: none, margin: 0pt)[
  #image("zadani.pdf", page: 1, width: 100%, height: 100%)
]
#page(numbering: none, margin: 0pt)[
  #image("zadani.pdf", page: 2, width: 100%, height: 100%)
]
#page(numbering: none, margin: 0pt)[
  #image("zadani.pdf", page: 3, width: 100%, height: 100%)
]

// =============================================================================
// ČESTNÉ PROHLÁŠENÍ (Declaration)
// =============================================================================
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

// =============================================================================
// PODĚKOVÁNÍ (Acknowledgement)
// =============================================================================
#page(numbering: none)[
  #v(1fr)

  // TODO: Napsat poděkování
  Rád bych poděkoval ... za ...

  #v(1fr)
]

// =============================================================================
// RESUMÉ A KLÍČOVÁ SLOVA (Abstract and keywords)
// =============================================================================
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

// =============================================================================
// OBSAH (Table of contents)
// =============================================================================
#page(numbering: none)[
  #heading(outlined: false, numbering: none)[Obsah]
  #outline(
    title: none,
    indent: 2em,
    depth: 3,
  )
]

// *****************************************************************************
// HLAVNÍ ČÁST (MAIN MATTER) - číslované strany, vlastní obsah práce
// *****************************************************************************
#set page(
  numbering: "1",
)
#counter(page).update(7)

// =============================================================================
// ÚVOD
// =============================================================================
= Úvod
\
V dnešní době naše škola nemá jednotné řešení pro správu celého životního cyklu maturitních projektů. Celý proces – od výběru tématu přes průběžné konzultace až po finální odevzdání a hodnocení – probíhá nekoordinovaně prostřednictvím různých nástrojů: e-mailů, sdílených složek a papírových formulářů. Tento přístup je náchylný k chybám, nepřehledný a časově náročný pro všechny zúčastněné strany.

Cílem této práce je vytvořit webový informační systém SubmiTheses, který tento problém řeší komplexním způsobem.

*Studenti* se mohou přihlásit k tématu ze seznamu volných prací, odevzdávat a spravovat přílohy svého projektu a sledovat stav hodnocení.

*Vedoucí prací* mohou snadno vytvářet a upravovat témata maturitních projektů, přiřazovat vybrané studenty ze seznamu zájemců, průběžně sledovat vývoj projektu a hodnotit odevzdané práce pomocí konfigurovatelných hodnotících škál.

*Administrátoři* mají plnou kontrolu nad celým systémem – mohou spravovat uživatelské účty, akademické roky, předměty, hodnotící škály a také přímo upravovat či spravovat jednotlivé projekty.

Systém tak centralizuje veškerou komunikaci a dokumentaci na jednom místě, čímž zvyšuje přehlednost, snižuje administrativní zátěž a minimalizuje riziko ztráty důležitých souborů či informací.


// =============================================================================
// TEORETICKÁ ČÁST
// =============================================================================
= Teoretická část

// TODO: Napsat teoretickou část
// - Zmapování současného stavu
// - Podklady pro řešení
// - NEPIŠTE dlouhé seznamy technologií! Max 1 strana, jen pokud je to relevantní

== Existující řešení
// Analýza podobných řešení na trhu

== Použité technologie
// Stručně, jen důležité technologie s odůvodněním výběru


// =============================================================================
// METODIKA A VLASTNÍ ŘEŠENÍ
// =============================================================================
= Metodika a vlastní řešení

// TODO: Popsat postup práce, architekturu, implementaci

== Architektura systému
// Popis komponent, vrstev, jak spolu interagují
// Vložit diagram architektury

== Datový model
// Popis databázového modelu, tabulek a vztahů
// Vložit ER diagram

== Návrh uživatelského rozhraní
// Wireframy, mockupy, popis UI

== Implementace
// Popis důležitých algoritmů a postupů

=== Backendová část
// Popis serverové části

=== Frontendová část
// Popis klientské části


// =============================================================================
// DOKUMENTACE API (povinné pokud má projekt vlastní API)
// =============================================================================
= Dokumentace API

// TODO: Dokumentovat všechny endpointy
// - Seznam endpointů
// - Vstupní parametry
// - Návratové hodnoty

== Autentizace
// Popis autentizačního mechanismu

== Seznam endpointů

// Příklad dokumentace endpointu:
// === GET /api/users
// *Popis:* Vrátí seznam všech uživatelů
// *Parametry:* žádné
// *Návratová hodnota:* JSON array uživatelů


// =============================================================================
// UŽIVATELSKÁ PŘÍRUČKA
// =============================================================================
= Uživatelská příručka

// TODO: Napsat návod k použití aplikace

== Instalace
// Návod k instalaci (lokální, nasazení na server)

== Použití aplikace
// Popis práce s aplikací, screenshoty


// =============================================================================
// VÝSLEDKY
// =============================================================================
= Výsledky

// TODO: Popsat co bylo vytvořeno/zjištěno
// - Stručně, jasně, bez komentářů
// - Fakty, tabulky, grafy


// =============================================================================
// DISKUSE
// =============================================================================
= Diskuse

// TODO: Napsat diskusi
// - Zdůvodnění zvoleného řešení
// - Porovnání s jinými variantami
// - Co se povedlo, co ne
// - Realizační možnosti výsledků


// =============================================================================
// ZÁVĚR
// =============================================================================
= Závěr

// TODO: Napsat závěr
// - Celkové hodnocení
// - Splnění cílů ze zadání
// - Možné rozšíření do budoucna


// *****************************************************************************
// ZÁVĚREČNÁ ČÁST (BACK MATTER) - literatura, seznamy, přílohy
// *****************************************************************************

// =============================================================================
// LITERATURA (Bibliography)
// =============================================================================
#heading(numbering: none)[Literatura]



// =============================================================================
// SEZNAM OBRÁZKŮ
// =============================================================================
#heading(numbering: none)[Seznam obrázků]

// TODO: Vygenerovat automaticky nebo napsat ručně
// Obr. 1: Popis obrázku ..... str. X


// =============================================================================
// SEZNAM TABULEK
// =============================================================================
#heading(numbering: none)[Seznam tabulek]

// TODO: Vygenerovat automaticky nebo napsat ručně


// =============================================================================
// SEZNAM PŘÍLOH
// =============================================================================
#heading(numbering: none)[Seznam příloh]

// TODO: Seznam příloh
// Příloha A: Název přílohy


// =============================================================================
// PŘÍLOHY
// =============================================================================
#pagebreak()
#heading(numbering: none)[Přílohy]

// TODO: Vložit přílohy (velké obrázky, tabulky, kód...)
// Přílohy se číslují římsky nebo písmeny (A, B, C...)
