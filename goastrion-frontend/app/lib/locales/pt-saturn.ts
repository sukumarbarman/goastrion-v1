//Portuguese(pt)
// goastrion-frontend/app/lib/locales/pt-saturn.ts
const ptSaturn = {
  zodiac: {
    aries: "Áries",
    taurus: "Touro",
    gemini: "Gêmeos",
    cancer: "Câncer",
    leo: "Leão",
    virgo: "Virgem",
    libra: "Libra",
    scorpio: "Escorpião",
    sagittarius: "Sagitário",
    capricorn: "Capricórnio",
    aquarius: "Aquário",
    pisces: "Peixes",
  },

  // Opcional: rótulos curtos
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

  // Apelido caso outra parte use "rashi.*"
  rashi: {
    aries: "Áries",
    taurus: "Touro",
    gemini: "Gêmeos",
    cancer: "Câncer",
    leo: "Leão",
    virgo: "Virgem",
    libra: "Libra",
    scorpio: "Escorpião",
    sagittarius: "Sagitário",
    capricorn: "Capricórnio",
    aquarius: "Aquário",
    pisces: "Peixes",
  },

  saturn: {
    sadesati: {
      title: "Saturno · Sade Sati",
      subtitle:
        "Visão compacta das suas janelas de Sade Sati com dias de estação e sobreposições retrógradas.",

      // Ajuda e controles
      fast_preview:
        "Prévia rápida (20 anos a partir de hoje). Carregue o histórico completo quando quiser.",
      full_view_helper: "Histórico completo (~100 anos desde o nascimento).",
      view: "Ver",
      "view.preview": "Prévia: 20 anos a partir de hoje",
      "view.preview.tip": "Intervalo de prévia a partir de hoje",
      "view.full": "Mostrar completo (100 anos desde o nascimento)",
      "view.full.tip": "Histórico completo desde o nascimento",
      export: "Exportar CSV",
      "export.tip": "Exportar linhas visíveis para CSV",

      meta: { anchor: "Âncora", start: "Início", horizon: "Horizonte" },
      years: "anos",
      horizon_years: "{y} anos",

      caution_dates: "Datas de cautela",
      no_station_in_view: "Sem dias de estação na visão",

      col: {
        phase: "Fase",
        start: "Início",
        end: "Fim",
        duration: "Duração",
        moon_sign: "Signo lunar",
        saturn_sign: "Signo de Saturno",
        stations: "Estações",
        retros: "Sobreposições retrógradas",
      },

      empty: "Não há janelas de Sade Sati no horizonte selecionado.",

      phase: {
        start: "início — Primeiro Dhaiyya",
        peak: "pico — Segundo Dhaiyya (no signo lunar)",
        end: "fim — Terceiro Dhaiyya",
      },

      chip: { clear: "Fluxo claro", review: "Revisar/Ajustar", caution: "Dia(s) de cautela" },

      good_pct: "{pct}% dias claros",
      samples: "dias claros de amostra",
      more: "+{n} mais",
      all_station_dates: "Todas as datas de estação",
      all_retro_overlaps: "Todas as sobreposições retrógradas",

      tip: {
        clear: "Fluxo claro.",
        combo:
          "Estações: o impulso fica instável—evite compromissos totalmente novos; finalize o que já está em curso; confira a papelada.\nSobreposição retrógrada: ótimo para revisões, correções e renegociações. Espere retrabalho—adicione folga aos prazos.",
        station: {
          full:
            "Dia(s) de estação: o impulso está instável. Evite compromissos totalmente novos; revise e finalize o que está em curso; confira a papelada.",
          short:
            "Dica: Evite compromissos novos; finalize o que está em curso; confira a papelada.",
        },
        retro: {
          full:
            "Sobreposição retrógrada: ótimo para revisões, correções e renegociações. Espere retrabalho—adicione folga aos prazos.",
          short:
            "Dica: Melhor para revisões, correções e renegociações. Espere retrabalho—adicione folga.",
        },
        col: {
          phase: "Fase da janela de Sade Sati e chip de fluxo geral.",
          start: "Data de início da janela.",
          end: "Data de término da janela.",
          duration: "Intervalo total (em dias) desta janela.",
          moon_sign: "Seu signo lunar natal relevante para esta janela.",
          saturn_sign: "Signo por onde Saturno transita nesta janela.",
          stations: "Datas em que Saturno fica estacionário (entrando/saindo do retrógrado).",
          retros: "Períodos que se sobrepõem ao retrógrado de Saturno.",
        },
      },

      foot: {
        station: {
          label: "Estações",
          text:
            "O impulso fica instável. Evite compromissos totalmente novos; revise e finalize o que está em curso; confira a papelada.",
        },
        retro: {
          label: "Sobreposições retrógradas",
          text:
            "Excelente para revisões, correções e renegociações. Espere retrabalho—adicione folga aos prazos.",
        },
      },

      duration_days: "{d}d",

      // Sobre (seção/modal)
      about: {
        title: "O que é Sade Sati?",
        blurb:
          "Sade Sati é um período de ~7½ anos quando Saturno transita em torno do seu signo lunar: o signo anterior, o próprio signo e o signo seguinte. Costuma ser vivido em três fases—início, pico e fim—cada uma com um tom diferente de lições, responsabilidades e pressão. Use esta visão para ver os intervalos e as datas críticas de relance.",
        termsTitle: "Termos-chave",
        terms: {
          start:
            "Saturno no signo anterior ao seu signo lunar—prepara o terreno; mais preparação e base.",
          peak:
            "Saturno sobre o seu signo lunar—lições centrais, maior pressão e reestruturação.",
          end:
            "Saturno no signo seguinte ao seu signo lunar—consolidação e estabilização.",
          station:
            "Saturno parece pausar (entrando/saindo do retrógrado). O impulso pode ficar instável—evite compromissos totalmente novos; finalize o que está em curso.",
          retro:
            "Melhor para revisões, correções e renegociações. Espere retrabalho—adicione folga aos prazos.",
        },
      },

      // Erros
      error: {
        create_first: "Crie seu mapa natal primeiro (aba Criar).",
        missing_birth: "Dados de nascimento ausentes. Gere novamente seu mapa.",
        fetch: "Falha ao buscar o panorama de Saturno.",
      },
    },
  },
};

export default ptSaturn;
