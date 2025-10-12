//Spanish (es)
// goastrion-frontend/app/lib/locales/es-saturn.ts
const esSaturn = {
  zodiac: {
    aries: "Aries",
    taurus: "Tauro",
    gemini: "Géminis",
    cancer: "Cáncer",
    leo: "Leo",
    virgo: "Virgo",
    libra: "Libra",
    scorpio: "Escorpio",
    sagittarius: "Sagitario",
    capricorn: "Capricornio",
    aquarius: "Acuario",
    pisces: "Piscis",
  },

  // Opcional: etiquetas cortas
  zodiac_short: {
    aries: "Ari",
    taurus: "Tau",
    gemini: "Gem",
    cancer: "Can",
    leo: "Leo",
    virgo: "Vir",
    libra: "Lib",
    scorpio: "Sco",
    sagittarius: "Sag",
    capricorn: "Cap",
    aquarius: "Aqu",
    pisces: "Pis",
  },

  // Alias por si otra parte de la app usa "rashi.*"
  rashi: {
    aries: "Aries",
    taurus: "Tauro",
    gemini: "Géminis",
    cancer: "Cáncer",
    leo: "Leo",
    virgo: "Virgo",
    libra: "Libra",
    scorpio: "Escorpio",
    sagittarius: "Sagitario",
    capricorn: "Capricornio",
    aquarius: "Acuario",
    pisces: "Piscis",
  },

  saturn: {
    sadesati: {
      title: "Saturno · Sade Sati",
      subtitle:
        "Vista compacta de tus periodos de Sade Sati con días de estación y solapes retrógrados.",

      // Textos de ayuda y controles
      fast_preview:
        "Vista rápida (20 años desde hoy). Carga el historial completo cuando quieras.",
      full_view_helper: "Historial completo (~100 años desde el nacimiento).",
      view: "Ver",
      "view.preview": "Vista previa: 20 años desde hoy",
      "view.preview.tip": "Rango de vista previa desde hoy",
      "view.full": "Mostrar completo (100 años desde el nacimiento)",
      "view.full.tip": "Historial completo desde el nacimiento",
      export: "Exportar CSV",
      "export.tip": "Exporta las filas visibles a CSV",

      meta: { anchor: "Ancla", start: "Inicio", horizon: "Horizonte" },
      years: "años",
      horizon_years: "{y} años",

      caution_dates: "Fechas de precaución",
      no_station_in_view: "No hay días de estación en la vista",

      col: {
        phase: "Fase",
        start: "Inicio",
        end: "Fin",
        duration: "Duración",
        moon_sign: "Signo lunar",
        saturn_sign: "Signo de Saturno",
        stations: "Estaciones",
        retros: "Solapes retrógrados",
      },

      empty: "No hay periodos de Sade Sati en el horizonte seleccionado.",

      phase: {
        start: "inicio — Primer Dhaiyya",
        peak: "cima — Segundo Dhaiyya (en signo lunar)",
        end: "fin — Tercer Dhaiyya",
      },

      chip: { clear: "Flujo claro", review: "Revisar/Revisar", caution: "Día(s) de precaución" },

      good_pct: "{pct}% días claros",
      samples: "días claros de muestra",
      more: "+{n} más",
      all_station_dates: "Todas las fechas de estación",
      all_retro_overlaps: "Todos los solapes retrógrados",

      tip: {
        clear: "Flujo claro.",
        combo:
          "Estaciones: el impulso es inestable—evita compromisos totalmente nuevos; finaliza lo en curso; verifica la documentación.\nSolape retrógrado: ideal para revisiones, correcciones y renegociaciones. Espera retrabajo—agrega margen a los plazos.",
        station: {
          full:
            "Día(s) de estación: el impulso es inestable. Evita compromisos totalmente nuevos; revisa y finaliza lo en curso; verifica la documentación.",
          short:
            "Consejo: Evita compromisos nuevos; finaliza lo en curso; verifica la documentación.",
        },
        retro: {
          full:
            "Solape retrógrado: ideal para revisiones, correcciones y renegociaciones. Espera retrabajo—agrega margen a los plazos.",
          short:
            "Consejo: Mejor para revisiones, correcciones y renegociaciones. Espera retrabajo—agrega margen.",
        },
        col: {
          phase: "Fase del periodo de Sade Sati y chip de flujo general.",
          start: "Fecha de inicio del periodo.",
          end: "Fecha de fin del periodo.",
          duration: "Duración total (en días) de este periodo.",
          moon_sign: "Tu signo lunar natal relevante para este periodo.",
          saturn_sign: "Signo por el que transita Saturno en este periodo.",
          stations: "Fechas en que Saturno está estacionario (entra/sale de retrógrado).",
          retros: "Periodos que se solapan con el retrógrado de Saturno.",
        },
      },

      foot: {
        station: {
          label: "Estaciones",
          text:
            "El impulso es inestable. Evita compromisos totalmente nuevos; revisa y finaliza lo en curso; verifica la documentación.",
        },
        retro: {
          label: "Solapes retrógrados",
          text:
            "Excelente para revisiones, correcciones y renegociaciones. Espera retrabajo—agrega margen a los plazos.",
        },
      },

      duration_days: "{d}d",

      // Acerca de (sección/modal)
      about: {
        title: "¿Qué es Sade Sati?",
        blurb:
          "Sade Sati es un periodo de ~7½ años cuando Saturno transita alrededor de tu signo lunar: el signo anterior, el propio signo y el signo siguiente. A menudo se experimenta en tres fases—inicio, cima y fin—cada una con un matiz de lecciones, responsabilidades y presión. Usa esta vista para ver los intervalos y fechas críticas de un vistazo.",
        termsTitle: "Términos clave",
        terms: {
          start:
            "Saturno en el signo anterior a tu signo lunar—marca el terreno; más preparación y base.",
          peak:
            "Saturno sobre tu signo lunar—lecciones centrales, mayor presión y reestructuración.",
          end:
            "Saturno en el signo posterior a tu signo lunar—consolidación y estabilización.",
          station:
            "Saturno parece pausar (entrando/saliendo de retrógrado). El impulso puede ser inestable—evita compromisos totalmente nuevos; finaliza lo en curso.",
          retro:
            "Mejor para revisiones, correcciones y renegociaciones. Espera retrabajo—agrega margen a los plazos.",
        },
      },

      // Errores
      error: {
        create_first: "Crea tu carta natal primero (pestaña Crear).",
        missing_birth: "Faltan datos de nacimiento. Vuelve a generar tu carta.",
        fetch: "No se pudo obtener el resumen de Saturno.",
      },
    },
  },
};

export default esSaturn;
