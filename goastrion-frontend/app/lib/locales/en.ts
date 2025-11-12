// app/lib/locales/en.ts
import core from "./en-core";
import insights from "./en-insights";
import saturn from "./en-saturn";
import daily from "./en-daily";
import enAbout from "./en-about";
import enGuides from "./en-guides";
import { deepMerge } from "./_merge";

const en = deepMerge(
  deepMerge(
    deepMerge(
      deepMerge(
        deepMerge(core, insights),
        saturn
      ),
      daily
    ),
    enAbout
  ),
  enGuides
) as typeof core &
  typeof insights &
  typeof saturn &
  typeof daily &
  typeof enAbout &
  typeof enGuides;

export default en;
