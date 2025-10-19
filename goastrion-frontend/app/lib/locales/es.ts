// app/lib/locales/en.ts
import core from "./en-core";
import insights from "./en-insights";
import saturn from "./en-saturn";
import daily from "./en-daily";
import { deepMerge } from "./_merge";

const en = deepMerge(deepMerge(deepMerge(core, insights), saturn), daily);
export default en;
