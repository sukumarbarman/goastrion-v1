// goastrion-frontend/app/lib/locales/fr.ts
import core from "./fr-core";
import insights from "./fr-insights";
import saturn from "./fr-saturn";
import { deepMerge } from "./_merge";

const fr = deepMerge(deepMerge(core, insights), saturn) as
  typeof core & typeof insights & typeof saturn;

export default fr;
