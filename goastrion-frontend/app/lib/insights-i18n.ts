// app/lib/insights-i18n.ts
import { useI18n } from "../lib/i18n";

export function useChipLabel() {
  const { t } = useI18n();
  return (key: string) => {
    // try insights.* first
    const maybe = t(key as any);
    if (maybe !== key) return maybe;

    // fallback maps (optional quick wins)
    if (key.startsWith("chip.house_presence.")) {
      const dom = key.split(".").pop() || "";
      return t(`insights.${dom}.housePresence`) ?? key;
    }
    if (key.startsWith("chip.skill.")) {
      const sk = key.split(".").pop() || "";
      return t(`insights.skills.${sk}`) ?? key;
    }
    if (key.startsWith("chip.aspectClass.")) {
      const c = key.split(".").pop() || "";
      return t(`insights.aspectClass.${c}`) ?? key;
    }
    if (key.startsWith("chip.aspect.")) {
      const a = key.split(".").pop() || "";
      return t(`insights.aspect.${a}`) ?? key;
    }
    return key; // safe fallback
  };
}
