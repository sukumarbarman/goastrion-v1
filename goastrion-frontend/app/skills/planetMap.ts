// app/(wherever)/skills/planetMap.ts
export const CHIP_TO_PLANETS: Record<string, string[]> = {
  "chip.skill.mercury": ["Mercury"],
  "chip.skill.jupiter": ["Jupiter"],
  "chip.skill.venus": ["Venus"],
  "chip.skill.mars": ["Mars"],
  "chip.skill.saturn": ["Saturn"],
  "chip.skill.sun": ["Sun"],
  "chip.skill.rahu10or11": ["Rahu"],

  // aspect chips don’t *have* to add planets (you already have the base planet chip),
  // but if you want them to reinforce, you can map both ends:
  "chip.skill.mercuryJupiterTrine": ["Mercury", "Jupiter"],
  "chip.skill.mercurySaturnTrine": ["Mercury", "Saturn"],
  "chip.skill.mercuryVenusTrine": ["Mercury", "Venus"],
  "chip.skill.mercuryMoonTrine": ["Mercury", "Moon"],
  "chip.skill.venusMoonTrine": ["Venus", "Moon"],
  "chip.skill.venusJupiterTrine": ["Venus", "Jupiter"],
  "chip.skill.sunMarsTrine": ["Sun", "Mars"],
  "chip.skill.sunJupiterTrine": ["Sun", "Jupiter"],
  "chip.skill.saturnMercuryTrine": ["Saturn", "Mercury"],
};
