// goastrion-frontend/app/lib/locales/es.ts
import core from "./es-core";
import insights from "./es-insights";
import saturn from "./es-saturn";
import { deepMerge } from "./_merge";

const es = deepMerge(deepMerge(core, insights), saturn) as
  typeof core & typeof insights & typeof saturn;

export default es;
