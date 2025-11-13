// app/lib/locales/hi.ts
import core from "./hi-core";
import insights from "./hi-insights";
import saturn from "./hi-saturn";
import daily from "./hi-daily";
import hiAbout from "./hi-about";
import hiGuides from "./hi-guides";
import { deepMerge } from "./_merge";
import hiFaq from "./hi-faq";
import hiResultsPage from "./hi-results-page";

const hi = deepMerge(
  deepMerge(
    deepMerge(
      deepMerge(
        deepMerge(
          core,
          insights
        ),
        saturn
      ),
      daily
    ),
    hiAbout
  ),
  deepMerge(
    deepMerge(hiGuides, hiFaq),
    hiResultsPage
  )
) as typeof core &
  typeof insights &
  typeof saturn &
  typeof daily &
  typeof hiAbout &
  typeof hiGuides &
  typeof hiFaq &
  typeof hiResultsPage;

export default hi;
