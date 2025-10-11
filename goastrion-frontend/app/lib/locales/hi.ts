import core from "./hi-core";
import insights from "./hi-insights";
import saturn from "./hi-saturn";
import { deepMerge } from "./_merge";

const hi = deepMerge(deepMerge(core, insights), saturn) as
  typeof core & typeof insights & typeof saturn;

export default hi;
