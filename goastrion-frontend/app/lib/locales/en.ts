// app/lib/locales/en.ts
import core from "./en-core";
import insights from "./en-insights";
import saturn from "./en-saturn";
import daily from "./en-daily";
import enAbout from "./en-about";
import enGuides from "./en-guides";
import { deepMerge } from "./_merge";
import enFaq from "./en-faq";
import enResultsPage from "./en-results-page";

const en = deepMerge(
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
    enAbout
  ),
  deepMerge(
    deepMerge(enGuides, enFaq),
    enResultsPage
  )
) as typeof core &
  typeof insights &
  typeof saturn &
  typeof daily &
  typeof enAbout &
  typeof enGuides &
  typeof enFaq &
  typeof enResultsPage;

export default en;
