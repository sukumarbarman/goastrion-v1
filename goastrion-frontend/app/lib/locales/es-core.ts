//Spanish — es

// app/lib/locales/es-core.ts
// UI común (Español LATAM por defecto)
const esCore = {
  navbar: {
    lifeSpheres: "Rueda de Vida",
    skills: "Habilidades",
    pricing: "Precios",
    about: "Acerca de",
    dashboard: "Panel",
    results: "Resultados",
    book: "Reservar cita",
    login: "Iniciar sesión",
    signup: "Registrarse",
    guides: "Guías",
    faq: "Preguntas frecuentes",
    saturn: "Saturno",
    vimshottari: "Vimshottari",
  },



  steps: {
    heading: "Cómo funciona",
    stepLabel: "Paso {{num}}",
    "1": { title: "Ingresa datos de nacimiento", desc: "Fecha, hora y lugar (seguro para IST)" },
    "2": { title: "Obtén carta e insights", desc: "Carta estilo norte de India + Saturno y habilidades" },
    "3": { title: "Ve ventanas ShubhDin", desc: "Cambio de trabajo, matrimonio, propiedad y más" },
  },

  shubhdin: {
    badge: "ShubhDin · Buen día",
    title: "Encuentra tu Shubh Din — siente el timing",
    sub: "Leemos tu carta y el contexto Saturno/Luna para sugerir ventanas más ligeras y de apoyo—para estudiar, entrevistas, lanzamientos, viajes o un día más calmado.",
    pt1: "Ventanas inteligentes desde tus datos de nacimiento (manejo IST/UTC)",
    pt2: "Notas de timing suaves—acción sobre ansiedad",
    pt3: "Contexto MD/AD opcional para tendencias largas",
    cta: "Ver mi ShubhDin",
    how: "Cómo funciona",
    tz: "India: elige IST (UTC+05:30). Fuera de India: convierte tu hora de nacimiento a UTC y elige UTC.",
    alt: "Joven sonriendo mientras revisa un calendario en su teléfono, esperanzada con un buen día",
  },

  domains: {
    badge: "Rueda de Vida",
    title: "Ve dónde enfocarte primero",
    sub: "Tu Rueda de Vida resalta Carrera, Finanzas, Matrimonio y Salud a partir de fortalezas de casas y aspectos planetarios—para que sepas dónde los pequeños esfuerzos rinden más.",
    career: "Carrera",
    careerSub: "fortalezas y ruta de aprendizaje",
    finance: "Finanzas",
    financeSub: "hábitos y decisiones de dinero",
    marriage: "Matrimonio",
    marriageSub: "patrones de compatibilidad",
    health: "Salud",
    healthSub: "rutinas sostenibles",
    cta: "Explorar Rueda de Vida",
  },

  hero: {
    headline: "Encuentra ShubhDin (fechas auspiciosas) y carta natal védica gratis — insights de Saturno y Sade Sati",
    subline: "Planifica cambio de trabajo, matrimonio o propiedad con ventanas respaldadas por datos de tu carta natal. Rápido, privado y optimizado para IST.",
    support: { before: "Comienza con una", chart: "carta natal", shubhdin: "ShubhDin (buenas fechas)", saturn: "Saturno/Sade Sati" },
    createBtn: "Crea tu carta",
    sampleBtn: "Ver informe de ejemplo",
    badgeSecure: "Seguro", badgePrivate: "Privado", badgeFast: "Rápido",
  },

  skills: {
    title: "Destello de habilidades",
    note: "<span class='text-slate-300'>Habilidades destacadas desde la carta natal — dobla la apuesta donde rindes más.</span>",
    sampleReport: "Ver informe de ejemplo",
    list: {
      analytical: { name: "Analítico", blurb: "Detección de patrones y lógica." },
      communication: { name: "Comunicación", blurb: "Escritura y habla claras." },
      leadership: { name: "Liderazgo", blurb: "Dirigir, organizar, inspirar." },
      creativity: { name: "Creatividad", blurb: "Ideas y estética." },
      focus: { name: "Enfoque", blurb: "Resistencia para trabajo profundo." },
      entrepreneurial: { name: "Emprendimiento", blurb: "Construir y lanzar." },
    },
  },

  home: {
    domains: {
      badge: "Rueda de Vida",
      title: "Ve dónde enfocarte primero",
      sub: "Tu Rueda de Vida resalta Carrera, Finanzas, Matrimonio y Salud a partir de fortalezas de casas y aspectos planetarios—para que sepas dónde los pequeños esfuerzos rinden más.",
      career: "Carrera", careerSub: "fortalezas y ruta de aprendizaje",
      finance: "Finanzas", financeSub: "hábitos y decisiones de dinero",
      marriage: "Matrimonio", marriageSub: "patrones de compatibilidad",
      health: "Salud", healthSub: "rutinas sostenibles",
      cta: "Explorar Rueda de Vida",
    },
    shubhdin: {
      badge: "ShubhDin · Buen día",
      title: "Encuentra tu Shubh Din — siente el timing",
      sub: "Obtén ventanas de fechas auspiciosas (ShubhDin) desde tu carta natal védica—optimizadas para cambio de trabajo, entrevistas, estudio, lanzamientos, viajes y días más calmados.",
      pt1: "Ventanas inteligentes desde tus datos de nacimiento (manejo IST/UTC)",
      pt2: "Contexto Saturno/Luna con notas de timing suaves y accionables",
      pt3: "Vimshottari MD/AD opcional para tendencias largas",
      cta: "Ver mi ShubhDin",
      learn: "Aprender más",
      how: "Cómo funciona",
      tz: "India: elige IST (UTC+05:30). Fuera de India: convierte tu hora de nacimiento a UTC y elige UTC.",
      alt: "Joven sonriendo mientras revisa un calendario en su teléfono, esperanzada con un buen día",
    },
  },

  create: {
    title: "Generar carta",
    note: "Ingresa tus datos de nacimiento para generar una carta estilo norte de India.",
    dob: "Fecha de nacimiento",
    tob: "Hora de nacimiento",
    timezone: "Zona horaria",
    place: "Lugar",
    placePlaceholder: "Ciudad, País (ej.: Kolkata, India)",
    find: "Buscar",
    finding: "Buscando...",
    lat: "Latitud",
    lon: "Longitud",
    generate: "Generar",
    generating: "Generando...",
    reset: "Reiniciar",
    validation: {
      missingFields: "Ingresa fecha, hora, latitud y longitud.",
      badDate: "Ingresa la fecha como YYYY-MM-DD.",
      badYearRange: "El año debe tener 4 dígitos y estar entre 1000 y 2099.",
    },
    locationFound: "Ubicación encontrada.",
  },

  cta: {
    domains: {
      title: "Rueda de Vida (Dominios)",
      desc: "Ve fortalezas en Carrera, Finanzas, Salud, Relaciones y más—de un vistazo.",
      btn: "Abrir Rueda de Vida",
    },
    skills: {
      title: "Habilidades destacadas",
      desc: "Descubre tus capacidades sobresalientes y cómo usarlas en empleo, negocio o crecimiento.",
      btn: "Ver habilidades",
    },
    saturn: {
      title: "Fases de Saturno (Sade Sati y más)",
      desc: "Ve tus ventanas de Sade Sati, tránsitos de Saturno, días de estación y periodos de precaución—personalizados con tus datos de nacimiento.",
      "desc.short": "Sigue Sade Sati, tránsitos y días de precaución para planificar con sabiduría.",
      btn: "Abrir Saturno",
    },
  },

  timezones: { ist: "IST (UTC+05:30)", utc: "UTC (UTC+00:00)" },

  results: {
    title: "Resumen de la carta",
    lagnaSign: "Ascendente (Lagna)",
    sunSign: "Signo solar",
    moonSign: "Signo lunar",
    moonNakshatra: "Nakshatra lunar",
    lagnaDeg: "Ascendente (grados)",
    sunDeg: "Sol (grados)",
    moonDeg: "Luna (grados)",
  },

  planets: {
    sun: "Sol", moon: "Luna", mars: "Marte", mercury: "Mercurio", jupiter: "Júpiter",
    venus: "Venus", saturn: "Saturno", rahu: "Rahu", ketu: "Ketu",
  },

  dasha: {
    sectionTitle: "Línea de tiempo Dasha",
    titleFullTimeline: "Vimshottari Mahadasha — Línea completa",
    colLord: "Regente", colStart: "Inicio", colEnd: "Fin", colDuration: "Duración", colADLord: "Regente AD",
    prevADTitle: "Mahadasha anterior — Antardasha",
    curADTitle: "Mahadasha actual — Antardasha",
    nextADTitle: "Próxima Mahadasha — Antardasha",
    noAntardasha: "No hay datos de Antardasha.",
  },

  errors: {
    genericGeocode: "No se pudo buscar ese lugar.",
    genericGenerate: "Error al generar la carta.",
  },

  zodiac: [
    "Aries","Tauro","Géminis","Cáncer","Leo","Virgo","Libra","Escorpio","Sagitario","Capricornio","Acuario","Piscis"
  ],
  nakshatras: [
    "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
    "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
    "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
  ],

  common: { loading: "Cargando...", search: "Buscar", retry: "Reintentar", notAvailable: "No disponible" },

  resultsPage: {
    title: "Informe de ejemplo",
    hero: {
      alt: "Joven sonriendo mientras revisa ShubhDin en GoAstrion",
    },
    cta: {
      generate: "Generar mi carta",
    },
    labels: {
      name: "Nombre",
      dob: "Fecha de nacimiento",
      time: "Hora",
      place: "Lugar",
    },
    sample: {
      nameValue: "Ejemplo: Reene",
      placeValue: "Kolkata, India",
      tzValue: "IST (UTC+05:30)",
    },

    lifeWheel: {
      heading: "Rueda de Vida",
      badge: "enfocar primero",
      sub: "Donde los pequeños esfuerzos rinden más. Puntuaciones ilustrativas.",
    },
    domains: {
      career: {
        title: "Carrera",
        summary:
          "Casas 1/10/6 fuertes. Bueno para roles analíticos y estructurados.",
      },
      finance: {
        title: "Finanzas",
        summary:
          "Potencial de hábitos estables; cuida gastos impulsivos durante Venus AD.",
      },
      marriage: {
        title: "Matrimonio",
        summary: "7ª equilibrada; rutinas de comunicación mejoran la armonía.",
      },
      health: {
        title: "Salud",
        summary:
          "Saturno apoya la disciplina; sueño + caminatas acumulan beneficios.",
      },
    },
    scoreAria: "Puntaje {score} de 100",

    skills: {
      heading: "Habilidades destacadas",
      badge: "fortalezas",
      analytical: {
        name: "Pensamiento analítico",
        note: "Reconocimiento claro de patrones; disfruta descomponer problemas.",
      },
      communication: {
        name: "Comunicación",
        note: "Resúmenes escritos nítidos; conviene cadencia semanal de compartir.",
      },
      focus: {
        name: "Enfoque y constancia",
        note:
          "Respaldado por Saturno—hábitos pequeños se acumulan (bloques de 50–60 min).",
      },
      entrepreneurship: {
        name: "Impulso emprendedor",
        note:
          "Buen sesgo a la acción; agrega revisión mensual para tracción.",
      },
    },

    shubhdin: {
      heading: "ShubhDin · Buenos días",
      badge: "próximas 2 semanas",
      tip:
        "Tip: fija un hábito clave (p. ej., estudio enfocado 50 min) en al menos una ventana ShubhDin cada semana.",
      row1: {
        date: "2025-10-11 (sáb)",
        window: "10:30–13:00",
        focus: "Estudio / Entrevistas",
        note: "Apoyo lunar + aspectos limpios",
      },
      row2: {
        date: "2025-10-14 (mar)",
        window: "09:15–11:45",
        focus: "Lanzamiento / Solicitudes",
        note: "Ventana con soporte de Mercurio",
      },
      row3: {
        date: "2025-10-18 (sáb)",
        window: "08:40–12:10",
        focus: "Viaje / Planificación",
        note: "Presión de Saturno ligera, aún bien",
      },
    },
    table: {
      date: "Fecha",
      window: "Ventana",
      bestFor: "Mejor para",
      note: "Nota",
    },

    dasha: {
      heading: "Contexto temporal · MD / AD",
      badge: "trasfondo",
      mdBackdrop: "MD (Trasfondo)",
      currentAd: "AD actual",
      nextAd: "Próxima AD",
      mdLord: "Saturno",
      currentLord: "Venus",
      nextLord: "Sol",
    },

    saturn: {
      heading: "Saturno · Sade Sati (Sade Saati / Sadasathi)",
      copy:
        "Enmarcamos Sade Sati como estructura, no susto: podar distracciones, construir rutinas y comprometerse con lo que importa. Combina ventanas ShubhDin con acciones pequeñas y repetibles—sueño, bloques de estudio, presupuestos—para salir más fuerte.",
    },

    footer: {
      startFree: "Empieza gratis — generar mi carta",
      readFaqs: "Leer preguntas frecuentes",
    },
  },
} as const;

export default esCore;
