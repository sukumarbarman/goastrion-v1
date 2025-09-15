// app/lib/skillsMapping.ts
export const CHIP_TO_PLANETS: Record<string, string[]> = {
  // generic strengths
  "chip.skill.mercury": ["Mercury"],
  "chip.skill.venus": ["Venus"],
  "chip.skill.sun": ["Sun"],
  "chip.skill.saturn": ["Saturn"],
  "chip.skill.mars": ["Mars"],
  "chip.skill.jupiter": ["Jupiter"],

  // pairs / trines etc. (we just highlight both planets)
  "chip.skill.mercuryJupiterTrine": ["Mercury", "Jupiter"],
  "chip.skill.mercurySaturnTrine": ["Mercury", "Saturn"],
  "chip.skill.mercuryVenusTrine": ["Mercury", "Venus"],
  "chip.skill.mercuryMoonTrine": ["Mercury", "Moon"],

  "chip.skill.venusMercuryTrine": ["Venus", "Mercury"],
  "chip.skill.venusMoonTrine": ["Venus", "Moon"],
  "chip.skill.venusJupiterTrine": ["Venus", "Jupiter"],

  "chip.skill.sunMarsTrine": ["Sun", "Mars"],
  "chip.skill.sunJupiterTrine": ["Sun", "Jupiter"],

  "chip.skill.saturnMercuryTrine": ["Saturn", "Mercury"],

  // domain-ish skill chip
  "chip.skill.rahu10or11": ["Rahu"],
};
