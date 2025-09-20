// app/lib/insights-i18n.ts
import { useI18n } from "../lib/i18n";

export function useChipLabel() {
  const { t } = useI18n();

  return (key: string): string => {
    // Try direct lookup first
    const direct = t(key);
    if (direct !== key) return direct;

    // Fallbacks by prefix
    if (key.startsWith("chip.house_presence.")) {
      const dom = key.split(".").pop() || "";
      // e.g., chip.house_presence.career -> insights.career.housePresence
      const alt = t(`insights.${dom}.housePresence`);
      return alt !== `insights.${dom}.housePresence` ? alt : key;
    }

    if (key.startsWith("chip.skill.")) {
      const sk = key.split(".").pop() || "";
      // e.g., chip.skill.mercury -> insights.skills.mercury (label)
      const alt = t(`insights.skills.${sk}`);
      return alt !== `insights.skills.${sk}` ? alt : key;
    }

    if (key.startsWith("chip.aspectClass.")) {
      const c = key.split(".").pop() || "";
      // e.g., chip.aspectClass.benefic -> insights.aspectClass.benefic
      const alt = t(`insights.aspectClass.${c}`);
      return alt !== `insights.aspectClass.${c}` ? alt : key;
    }

    if (key.startsWith("chip.aspect.")) {
      const a = key.split(".").pop() || "";
      // e.g., chip.aspect.Trine -> insights.aspect.Trine
      const alt = t(`insights.aspect.${a}`);
      return alt !== `insights.aspect.${a}` ? alt : key;
    }

    // Safe fallback
    return key;
  };
}
