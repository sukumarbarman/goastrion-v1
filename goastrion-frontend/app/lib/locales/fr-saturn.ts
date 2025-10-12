// goastrion-frontend/app/lib/locales/fr-saturn.ts
const frSaturn = {
  zodiac: {
    aries: "Bélier",
    taurus: "Taureau",
    gemini: "Gémeaux",
    cancer: "Cancer",
    leo: "Lion",
    virgo: "Vierge",
    libra: "Balance",
    scorpio: "Scorpion",
    sagittarius: "Sagittaire",
    capricorn: "Capricorne",
    aquarius: "Verseau",
    pisces: "Poissons",
  },

  // Optionnel : libellés courts
  zodiac_short: {
    aries: "Bel",
    taurus: "Tau",
    gemini: "Gém",
    cancer: "Can",
    leo: "Lion",
    virgo: "Vir",
    libra: "Bal",
    scorpio: "Sco",
    sagittarius: "Sag",
    capricorn: "Cap",
    aquarius: "Ver",
    pisces: "Poi",
  },

  // Alias au cas où une autre partie utilise "rashi.*"
  rashi: {
    aries: "Bélier",
    taurus: "Taureau",
    gemini: "Gémeaux",
    cancer: "Cancer",
    leo: "Lion",
    virgo: "Vierge",
    libra: "Balance",
    scorpio: "Scorpion",
    sagittarius: "Sagittaire",
    capricorn: "Capricorne",
    aquarius: "Verseau",
    pisces: "Poissons",
  },

  saturn: {
    sadesati: {
      title: "Saturne · Sade Sati",
      subtitle:
        "Vue compacte de vos périodes de Sade Sati avec jours stationnaires et chevauchements rétrogrades.",

      // Aide et contrôles
      fast_preview:
        "Aperçu rapide (20 ans à partir d’aujourd’hui). Chargez l’historique complet quand vous voulez.",
      full_view_helper: "Historique complet (~100 ans depuis la naissance).",
      view: "Voir",
      "view.preview": "Aperçu : 20 ans à partir d’aujourd’hui",
      "view.preview.tip": "Plage d’aperçu à partir d’aujourd’hui",
      "view.full": "Afficher complet (100 ans depuis la naissance)",
      "view.full.tip": "Historique complet depuis la naissance",
      export: "Exporter CSV",
      "export.tip": "Exporter les lignes visibles en CSV",

      meta: { anchor: "Ancre", start: "Début", horizon: "Horizon" },
      years: "ans",
      horizon_years: "{y} ans",

      caution_dates: "Dates de prudence",
      no_station_in_view: "Aucun jour stationnaire dans la vue",

      col: {
        phase: "Phase",
        start: "Début",
        end: "Fin",
        duration: "Durée",
        moon_sign: "Signe lunaire",
        saturn_sign: "Signe de Saturne",
        stations: "Stations",
        retros: "Chevauchements rétrogrades",
      },

      empty: "Aucune période de Sade Sati dans l’horizon sélectionné.",

      phase: {
        start: "début — Premier Dhaiyya",
        peak: "pic — Deuxième Dhaiyya (sur le signe lunaire)",
        end: "fin — Troisième Dhaiyya",
      },

      chip: { clear: "Flux clair", review: "Revoir/Réviser", caution: "Jour(s) de prudence" },

      good_pct: "{pct}% de jours clairs",
      samples: "échantillons de jours clairs",
      more: "+{n} de plus",
      all_station_dates: "Toutes les dates stationnaires",
      all_retro_overlaps: "Tous les chevauchements rétrogrades",

      tip: {
        clear: "Flux clair.",
        combo:
          "Stations : l’élan est instable—évitez les engagements totalement nouveaux ; finalisez les travaux en cours ; vérifiez la paperasse.\nChevauchement rétrograde : idéal pour revues, corrections et renégociations. Attendez-vous à du retravail—ajoutez de la marge aux délais.",
        station: {
          full:
            "Jour(s) stationnaire(s) : l’élan est instable. Évitez les engagements totalement nouveaux ; revoyez et finalisez les travaux en cours ; vérifiez la paperasse.",
          short:
            "Astuce : évitez les nouveaux engagements ; finalisez l’en cours ; vérifiez la paperasse.",
        },
        retro: {
          full:
            "Chevauchement rétrograde : idéal pour revues, corrections et renégociations. Attendez-vous à du retravail—ajoutez de la marge aux délais.",
          short:
            "Astuce : mieux pour revues, corrections et renégociations. Attendez-vous à du retravail—prévoyez de la marge.",
        },
        col: {
          phase: "Phase de la fenêtre Sade Sati et puce de flux global.",
          start: "Date de début de la fenêtre.",
          end: "Date de fin de la fenêtre.",
          duration: "Étendue totale (en jours) de cette fenêtre.",
          moon_sign: "Votre signe lunaire natal pertinent pour cette fenêtre.",
          saturn_sign: "Signe traversé par Saturne durant cette fenêtre.",
          stations: "Dates où Saturne est stationnaire (entre en/sort du rétrograde).",
          retros: "Périodes qui se chevauchent avec le rétrograde de Saturne.",
        },
      },

      foot: {
        station: {
          label: "Stations",
          text:
            "L’élan est instable. Évitez les engagements totalement nouveaux ; revoyez et finalisez les travaux en cours ; vérifiez la paperasse.",
        },
        retro: {
          label: "Chevauchements rétrogrades",
          text:
            "Idéal pour revues, corrections et renégociations. Attendez-vous à du retravail—ajoutez de la marge aux délais.",
        },
      },

      duration_days: "{d}j",

      // À propos (section/modale)
      about: {
        title: "Qu’est-ce que le Sade Sati ?",
        blurb:
          "Le Sade Sati est une période d’environ 7½ ans pendant laquelle Saturne transite autour de votre signe lunaire : le signe précédent, le signe lui-même et le signe suivant. On l’expérimente souvent en trois phases—début, pic et fin—chacune avec sa tonalité de leçons, responsabilités et pression. Utilisez cette vue pour apercevoir d’un coup d’œil les périodes et dates critiques.",
        termsTitle: "Termes clés",
        terms: {
          start:
            "Saturne dans le signe précédent votre signe lunaire—mise en place ; davantage de préparation et de fondations.",
          peak:
            "Saturne sur votre signe lunaire—leçons centrales, pression accrue et restructuration.",
          end:
            "Saturne dans le signe suivant votre signe lunaire—consolidation et stabilisation.",
          station:
            "Saturne semble marquer une pause (entre en/sort du rétrograde). L’élan peut être instable—évitez les engagements totalement nouveaux ; finalisez l’en cours.",
          retro:
            "Idéal pour revues, corrections et renégociations. Attendez-vous à du retravail—ajoutez de la marge aux délais.",
        },
      },

      // Erreurs
      error: {
        create_first: "Veuillez d’abord créer votre thème natal (onglet Créer).",
        missing_birth: "Informations de naissance manquantes. Veuillez régénérer votre thème.",
        fetch: "Échec du chargement de l’aperçu de Saturne.",
      },
    },
  },
};

export default frSaturn;
