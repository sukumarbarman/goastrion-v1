//French(fr)

// app/lib/locales/fr-core.ts
// UI commun
const frCore = {
  navbar: {
    lifeSpheres: "Roue de vie",
    skills: "Compétences",
    pricing: "Tarifs",
    about: "À propos",
    dashboard: "Tableau de bord",
    results: "Résultats",
    book: "Prendre rendez-vous",
    login: "Se connecter",
    signup: "Créer un compte",
    guides: "Guides",
    faq: "FAQ",
    saturn: "Saturne",
    vimshottari: "Vimshottari",
  },

  about: {
    title: "À propos de GoAstrion",
    subtitle: "Clarté pour élèves et professionnels — sans jargon",

    badge: {
      shubhdin: "ShubhDin · Jour favorable",
      saturn: "Saturne · Sade Sati",
    },

    tagline: {
      main:
        "GoAstrion aide élèves et professionnels à faire de meilleurs choix de vie grâce à des conseils clairs et pratiques — propulsés par l’astrologie védique.",
      spotlight:
        "Trouvez des jours plus calmes et porteurs — puis agissez. GoAstrion lit votre thème et le contexte Saturne/Lune pour mettre en avant des fenêtres ShubhDin pour les études, les entretiens, les lancements ou simplement une journée plus concentrée.",
    },

    list: {
      why: {
        title: "Pourquoi explorer maintenant ?",
        body: "Connaissez vos 1–2 prochaines bonnes fenêtres et utilisez-les — sans supposition, sans peur.",
      },
      saturn: {
        title: "Saturne · Sade Sati",
        body: "Nous l’abordons comme une structure, pas une frayeur : de petites habitudes répétables qui composent dans le temps.",
      },
      practical: {
        title: "Conçu pour l’action",
        body: "Langage clair, focus « Roue de vie », timings MD/AD en option — l’action plutôt que l’anxiété.",
      },
    },

    points: {
      career: "Carrière : trouvez vos forces et votre parcours d’apprentissage",
      finance: "Finance : planifiez des habitudes et des décisions d’argent",
      marriage: "Mariage : comprenez les schémas de compatibilité",
      health: "Santé : construisez des routines quotidiennes durables",
      education: "Éducation : choisissez matières et compétences en confiance",
    },

    cta: {
      start: "Commencer",
      generate: "Générer mon thème",
      checkShubhdin: "✨ Vérifier mes ShubhDin",
      howItWorks: "Comment ça marche",
    },

    timezone: {
      note:
        "Inde : choisissez IST (UTC+05:30). Hors Inde : convertissez votre heure de naissance en UTC et choisissez UTC.",
    },

    imageAlt: "Un·e étudiant·e explore des options de carrière sur GoAstrion",

    mission: {
      title: "Notre mission",
      body:
        "Nous traduisons des signaux astrologiques complexes en étapes simples et actionnables — pour choisir matières, carrières et habitudes avec clarté, pas confusion.",
    },
  },

  steps: {
    heading: "Comment ça marche",
    stepLabel: "Étape {{num}}",
    1: { title: "Saisir les détails de naissance", desc: "Date, heure et lieu (compatible IST)" },
    2: { title: "Obtenir thème & insights", desc: "Thème nord-indien + Saturne & compétences" },
    3: { title: "Voir les fenêtres ShubhDin", desc: "Changement d’emploi, mariage, propriété et plus" },
  },

  shubhdin: {
    badge: "ShubhDin · Jour favorable",
    title: "Trouvez vos Shubh Din — sentez le bon timing",
    sub: "Nous lisons votre thème et le contexte Saturne/Lune pour suggérer des fenêtres plus légères et porteuses — pour étudier, passer des entretiens, lancer, voyager, ou vivre une journée plus calme.",
    pt1: "Fenêtres intelligentes depuis vos données de naissance (IST/UTC gérés)",
    pt2: "Notes de timing douces — l’action avant l’anxiété",
    pt3: "Contexte MD/AD optionnel pour les tendances longues",
    cta: "Vérifier mes ShubhDin",
    how: "Comment ça marche",
    tz: "Inde : choisissez IST (UTC+05:30). Hors Inde : convertissez votre heure de naissance en UTC et choisissez UTC.",
    alt: "Jeune femme souriante consultant un calendrier sur son téléphone, confiante pour une bonne journée",
  },

  domains: {
    badge: "Roue de vie",
    title: "Savoir où concentrer vos efforts d’abord",
    sub: "Votre Roue de vie met en lumière Carrière, Finance, Mariage et Santé à partir des forces des maisons et des aspects planétaires — pour savoir où de petites actions paient gros.",
    career: "Carrière",
    careerSub: "forces & parcours d’apprentissage",
    finance: "Finance",
    financeSub: "habitudes & décisions d’argent",
    marriage: "Mariage",
    marriageSub: "schémas de compatibilité",
    health: "Santé",
    healthSub: "routines durables",
    cta: "Explorer la Roue de vie",
  },

  hero: {
    headline: "Trouvez ShubhDin (dates favorables) & thème védique gratuit — insights Saturne & Sade Sati",
    subline: "Planifiez changement d’emploi, mariage ou propriété avec des fenêtres appuyées par les données de votre thème natal. Rapide, privé, optimisé pour l’IST.",
    support: { before: "Commencez avec un", chart: "thème natal gratuit", shubhdin: "ShubhDin (bonnes dates)", saturn: "Saturne/Sade Sati" },
    createBtn: "Créer votre thème",
    sampleBtn: "Voir un rapport exemple",
    badgeSecure: "Sécurisé", badgePrivate: "Privé", badgeFast: "Rapide",
  },

  skills: {
    title: "Projecteur de compétences",
    note: "<span class='text-slate-300'>Aptitudes phares issues du thème natal — voyez où doubler la mise.</span>",
    sampleReport: "Voir un rapport exemple",
    list: {
      analytical: { name: "Analytique", blurb: "Repérage de motifs & logique." },
      communication: { name: "Communication", blurb: "Écriture & expression claires." },
      leadership: { name: "Leadership", blurb: "Diriger, organiser, inspirer." },
      creativity: { name: "Créativité", blurb: "Idées & esthétique." },
      focus: { name: "Concentration", blurb: "Endurance de travail en profondeur." },
      entrepreneurial: { name: "Esprit entrepreneurial", blurb: "Construire & livrer." },
    },
  },

  home: {
    domains: {
      badge: "Roue de vie",
      title: "Savoir où concentrer vos efforts d’abord",
      sub: "Votre Roue de vie met en lumière Carrière, Finance, Mariage et Santé à partir des forces des maisons et des aspects planétaires — pour savoir où de petites actions paient gros.",
      career: "Carrière", careerSub: "forces & parcours d’apprentissage",
      finance: "Finance", financeSub: "habitudes & décisions d’argent",
      marriage: "Mariage", marriageSub: "schémas de compatibilité",
      health: "Santé", healthSub: "routines durables",
      cta: "Explorer la Roue de vie",
    },
    shubhdin: {
      badge: "ShubhDin · Jour favorable",
      title: "Trouvez vos Shubh Din — sentez le bon timing",
      sub: "Obtenez des fenêtres de dates favorables (ShubhDin) depuis votre thème védique — optimisées pour changement d’emploi, entretiens, études, lancements, voyages et journées plus calmes.",
      pt1: "Fenêtres intelligentes depuis vos données de naissance (IST/UTC gérés)",
      pt2: "Contexte Saturne/Lune avec des notes de timing douces et actionnables",
      pt3: "Vimshottari MD/AD optionnel pour les tendances longues",
      cta: "Vérifier mes ShubhDin",
      learn: "En savoir plus",
      how: "Comment ça marche",
      tz: "Inde : choisissez IST (UTC+05:30). Hors Inde : convertissez votre heure de naissance en UTC et choisissez UTC.",
      alt: "Jeune femme souriante consultant un calendrier sur son téléphone, confiante pour une bonne journée",
    },
  },

  create: {
    title: "Générer le thème",
    note: "Saisissez vos détails de naissance pour générer un thème de style nord-indien.",
    dob: "Date de naissance",
    tob: "Heure de naissance",
    timezone: "Fuseau horaire",
    place: "Lieu",
    placePlaceholder: "Ville, Pays (ex. : Kolkata, Inde)",
    find: "Chercher",
    finding: "Recherche…",
    lat: "Latitude",
    lon: "Longitude",
    generate: "Générer",
    generating: "Génération…",
    reset: "Réinitialiser",
    validation: {
      missingFields: "Veuillez saisir la date, l’heure, la latitude et la longitude.",
      badDate: "Veuillez entrer la date au format AAAA-MM-JJ.",
      badYearRange: "L’année doit comporter 4 chiffres et être entre 1000 et 2099.",
    },
    locationFound: "Lieu trouvé.",
  },

  cta: {
    domains: {
      title: "Roue de vie (Domaines)",
      desc: "Voyez les forces en Carrière, Finance, Santé, Relations et plus — en un coup d’œil.",
      btn: "Ouvrir la Roue de vie",
    },
    skills: {
      title: "Compétences clés",
      desc: "Découvrez vos aptitudes phares et comment les utiliser pour l’emploi, le business ou la croissance.",
      btn: "Voir les compétences",
    },
    saturn: {
      title: "Phases de Saturne (Sade Sati & plus)",
      desc: "Voyez vos fenêtres de Sade Sati, transits de Saturne, jours de station et périodes de prudence — personnalisés depuis vos données de naissance.",
      "desc.short": "Suivez Sade Sati, transits et jours de prudence pour planifier judicieusement.",
      btn: "Ouvrir Saturne",
    },
  },

  timezones: { ist: "IST (UTC+05:30)", utc: "UTC (UTC+00:00)" },

  results: {
    title: "Résumé du thème",
    lagnaSign: "Ascendant (Lagna)",
    sunSign: "Signe solaire",
    moonSign: "Signe lunaire",
    moonNakshatra: "Nakshatra de la Lune",
    lagnaDeg: "Ascendant (deg)",
    sunDeg: "Soleil (deg)",
    moonDeg: "Lune (deg)",
  },

  planets: {
    sun: "Soleil", moon: "Lune", mars: "Mars", mercury: "Mercure", jupiter: "Jupiter",
    venus: "Vénus", saturn: "Saturne", rahu: "Rahu", ketu: "Ketu",
  },

  dasha: {
    sectionTitle: "Frise Dasha",
    titleFullTimeline: "Vimshottari Mahadasha — frise complète",
    colLord: "Maître", colStart: "Début", colEnd: "Fin", colDuration: "Durée", colADLord: "Seigneur AD",
    prevADTitle: "Mahadasha précédent — Antardasha",
    curADTitle: "Mahadasha actuel — Antardasha",
    nextADTitle: "Mahadasha suivant — Antardasha",
    noAntardasha: "Aucune donnée d’Antardasha disponible.",
  },

  errors: {
    genericGeocode: "Impossible de trouver ce lieu.",
    genericGenerate: "Échec de génération du thème.",
  },

  zodiac: ["Bélier","Taureau","Gémeaux","Cancer","Lion","Vierge","Balance","Scorpion","Sagittaire","Capricorne","Verseau","Poissons"],
  nakshatras: [
    "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
    "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
    "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
  ],

  common: { loading: "Chargement…", search: "Rechercher", retry: "Réessayer", notAvailable: "Indisponible" },

  guides: {
    title: "Guides",
    hero: {
      blurb:
        "Guides courts et pratiques pour utiliser GoAstrion et décider mieux en carrière, finance, mariage, santé et éducation.",
      ctaGenerate: "Générer mon thème",
    },
    how: {
      title: "Comment fonctionne GoAstrion",
      step1: {
        title: "1. Saisir les détails de naissance",
        desc: "La date, l’heure et le lieu nous aident à calculer votre thème style nord-indien.",
      },
      step2: {
        title: "2. Obtenir des insights",
        desc: "Nous mettons en avant maisons, planètes et aspects qui structurent vos priorités.",
      },
      step3: {
        title: "3. Agir avec clarté",
        desc: "Suivez des étapes simples et actionnables alignées sur vos forces et le timing.",
      },
    },
    topics: {
      title: "Commencer par un thème",
      cards: {
        career: {
          title: "Carrière",
          blurb: "Faire correspondre forces et rôles, choisir des compétences, suivre les fenêtres de progression.",
        },
        finance: {
          title: "Finance",
          blurb: "Comprendre les fenêtres de revenus et aligner les habitudes financières sur les rythmes.",
        },
        marriage: {
          title: "Mariage",
          blurb: "Voir les facteurs de compatibilité et bâtir de meilleures routines de communication.",
        },
        health: {
          title: "Santé",
          blurb: "Créer des routines durables synchronisées avec l’énergie et le stress.",
        },
      },
    },
    qa: {
      q1: {
        q: "Ai-je besoin de l’heure exacte de naissance ?",
        a: "Plus c’est précis, mieux c’est pour l’ascendant et les maisons. Si inconnue, essayez une plage horaire et comparez ce qui résonne le plus juste.",
      },
      q2: {
        q: "Est-ce prédictif ?",
        a: "Nous mettons l’accent sur le timing + les tendances, puis les traduisons en actions pratiques sous votre contrôle.",
      },
      q3: {
        q: "Va-t-on me dire un seul métier à choisir ?",
        a: "Nous relions vos forces à plusieurs pistes et proposons des expérimentations pour valider rapidement.",
      },
      q4: {
        q: "Peut-on l’utiliser pour des élèves ?",
        a: "Oui — utilisez le focus Éducation pour choisir matières et parcours de compétences en confiance.",
      },
    },
    cta: {
      title: "Prêt·e à voir votre thème ?",
      blurb: "Générez votre thème et explorez des insights sur mesure en quelques minutes.",
      btn: "Générer mon thème",
    },
  },

  // ⬇️ Bloc FAQ de niveau racine
  faqPage: {
    heading: "Foire aux questions",
    introPrefix: "Nouveau sur GoAstrion ? Commencez par la page",
    introMiddle: "puis explorez la",
    introAnd: "et",
    linkCreate: "Créer",
    linkLifeWheel: "Roue de vie",
    linkSkills: "Compétences",
    featured: [
      {
        q: "Qu’est-ce que ShubhDin (jour favorable) ?",
        a: "ShubhDin est une fenêtre de temps porteuse suggérée depuis vos données de naissance et le contexte Saturne/Lune. Utilisez-la pour des sessions d’étude, des entretiens, des lancements, la planification de voyages ou simplement une journée plus calme pour avancer sur l’important.",
      },
      {
        q: "Comment GoAstrion choisit-il les fenêtres ShubhDin ?",
        a: "Nous calculons votre thème en UTC ou IST, puis détectons un contexte lunaire plus léger et des aspects « propres » sur l’horizon choisi. Nous évitons les jours de station et mettons en avant les fenêtres où la friction est moindre pour que de petites actions composent.",
      },
      {
        q: "Qu’est-ce que Saturne · Sade Sati et comment l’utiliser ?",
        a: "Nous traitons Sade Sati comme une structure, pas une frayeur : période pour élaguer les distractions et bâtir des routines. Attendez-vous à plus de jours de revue/discipline. Associez les ShubhDin à de petites actions répétables — sommeil, blocs d’étude, budget — pour en sortir renforcé·e.",
      },
      {
        q: "Que signifient « station » ou « chevauchement rétro » dans l’app ?",
        a: "Jours de station = élan instable ; évitez les engagements neufs à haut risque et relisez la paperasse. Chevauchements de rétro = idéaux pour revues, corrections et renégociations — simplement prévoir du temps pour les retours.",
      },
    ],
    items: [
      { q: "Pourquoi l’utiliser ?", a: "GoAstrion transforme vos données de naissance en conseils clairs et pratiques — contexte quotidien, tendances de compétences et fenêtres porteuses — pour concentrer vos efforts là où ils paient." },
      { q: "Le thème est-il gratuit ?", a: "Oui. Vous pouvez générer un thème de base gratuitement ; certaines frises avancées ou insights pro pourront être proposés plus tard." },
      { q: "Utilisez-vous des calculs védiques (sidéraux) et un style nord-indien ?", a: "Oui. GoAstrion utilise des calculs sidéraux et rend les thèmes au format nord-indien." },
      { q: "Quels détails faut-il pour générer un thème ?", a: "Date de naissance, heure de naissance et ville de naissance. Latitude/longitude aident mais la ville suffit pour la plupart." },
      { q: "Qu’est-ce que la Roue de vie ?", a: "La Roue de vie est notre vue de synthèse des domaines (Carrière, Finance, Santé, etc.) avec des mises en avant à explorer." },
      { q: "Que sont les Compétences ?", a: "Des tendances inférées de votre thème pour vous aider à miser sur vos forces (ex. : Analytique, Communication, Leadership)." },
      { q: "Comment fonctionne le fuseau horaire ? Dois-je saisir IST/UTC ?", a: "Né·e en Inde : choisissez IST. Sinon, choisissez l’UTC ou le fuseau local utilisé à la naissance pour la meilleure précision." },
      { q: "Quelles langues sont prises en charge ?", a: "Nous proposons actuellement l’anglais, l’hindi et le bengali, d’autres arrivent bientôt." },
      { q: "La latitude/longitude est-elle obligatoire ?", a: "Non. Sélectionner la ville de naissance suffit généralement ; vous pouvez ajouter lat/lon pour plus de précision." },
      { q: "Que sont MD et AD ?", a: "MD (Maha Dasha) et AD (Antar Dasha) sont des périodes planétaires védiques qui colorent les thèmes ; nous affichons périodes actuelle/suivante dans les frises." },
      { q: "Par où commencer ?", a: "Allez sur la page Créer, générez votre thème, puis ouvrez Roue de vie et Compétences pour des synthèses guidées." },
    ],
  },

  resultsPage: {
    title: "Rapport exemple",
    hero: {
      alt: "Jeune femme souriante vérifiant ShubhDin sur GoAstrion",
    },
    cta: {
      generate: "Générer mon thème",
    },
    labels: {
      name: "Nom",
      dob: "Date de naissance",
      time: "Heure",
      place: "Lieu",
    },
    sample: {
      nameValue: "Exemple : Reene",
      placeValue: "Kolkata, Inde",
      tzValue: "IST (UTC+05:30)",
    },

    lifeWheel: {
      heading: "Roue de vie",
      badge: "priorité",
      sub: "Où de petits efforts paient gros. Les scores sont illustratifs.",
    },
    domains: {
      career: {
        title: "Carrière",
        summary:
          "Maisons 1/10/6 solides. Bon pour des rôles analytiques et structurés.",
      },
      finance: {
        title: "Finance",
        summary:
          "Potentiel d’habitudes stables ; surveiller les dépenses impulsives durant Vénus AD.",
      },
      marriage: {
        title: "Mariage",
        summary: "7e équilibrée ; les routines de communication améliorent l’harmonie.",
      },
      health: {
        title: "Santé",
        summary:
          "Saturne soutient la discipline ; sommeil + marche composent les gains.",
      },
    },
    scoreAria: "Score {score} sur 100",

    skills: {
      heading: "Compétences clés",
      badge: "forces",
      analytical: {
        name: "Pensée analytique",
        note: "Reconnaissance claire des motifs ; aime décomposer les problèmes.",
      },
      communication: {
        name: "Communication",
        note: "Synthèses écrites nettes ; bénéfice d’un rythme de partage hebdo.",
      },
      focus: {
        name: "Focus & constance",
        note:
          "Porté par Saturne — petites routines qui composent (blocs de 50–60 min).",
      },
      entrepreneurship: {
        name: "Esprit entrepreneurial",
        note:
          "Bon biais vers l’action ; ajouter une revue mensuelle pour la traction.",
      },
    },

    shubhdin: {
      heading: "ShubhDin · Bons jours",
      badge: "2 semaines à venir",
      tip:
        "Astuce : verrouillez une habitude clé (ex. : 50 min d’étude) dans au moins une fenêtre ShubhDin chaque semaine.",
      row1: {
        date: "2025-10-11 (sam.)",
        window: "10:30–13:00",
        focus: "Études / Entretiens",
        note: "Soutien lunaire + aspects propres",
      },
      row2: {
        date: "2025-10-14 (mar.)",
        window: "09:15–11:45",
        focus: "Lancement / Candidatures",
        note: "Fenêtre soutenue par Mercure",
      },
      row3: {
        date: "2025-10-18 (sam.)",
        window: "08:40–12:10",
        focus: "Voyage / Planification",
        note: "Pression saturnienne légère, encore OK",
      },
    },
    table: {
      date: "Date",
      window: "Créneau",
      bestFor: "Idéal pour",
      note: "Note",
    },

    dasha: {
      heading: "Contexte temporel · MD / AD",
      badge: "arrière-plan",
      mdBackdrop: "MD (arrière-plan)",
      currentAd: "AD actuelle",
      nextAd: "AD suivante",
      mdLord: "Saturne",
      currentLord: "Vénus",
      nextLord: "Soleil",
    },

    saturn: {
      heading: "Saturne · Sade Sati (Sade Saati / Sadasathi)",
      copy:
        "Nous présentons Sade Sati comme une structure, pas une frayeur : élaguer les distractions, bâtir des routines et s’engager sur l’essentiel. Associez les fenêtres ShubhDin à de petites actions répétables — sommeil, blocs d’étude, budget — pour en sortir plus fort·e.",
    },

    footer: {
      startFree: "Commencer gratuitement — générer mon thème",
      readFaqs: "Lire la FAQ",
    },
  },

} as const;

export default frCore;
