// app/lib/locales/en.ts
import core from "./en-core";
import insights from "./en-insights";
import saturn from "./en-saturn";
import daily from "./en-daily";          // <-- add this
import { deepMerge } from "./_merge";

const en = deepMerge(deepMerge(deepMerge(core, insights), saturn), daily) as
  typeof core & typeof insights & typeof saturn & typeof daily;

export default en;
