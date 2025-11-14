import core from "./en-core";
import insights from "./en-insights";
import saturn from "./en-saturn";
import daily from "./en-daily";
import enAbout from "./en-about";
import enGuides from "./en-guides";
import { deepMerge } from "./_merge";
import enFaq from "./en-faq";
import enResultsPage from "./en-results-page";
import enShubhdin from "./en-shubhdin";   // ⬅️ NEW
import enDasha from "./en-dasha";         // ⬅️ NEW

// Merge all English modules
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
  deepMerge(
    deepMerge(
      deepMerge(enGuides, enFaq),
      enResultsPage
    ),
    deepMerge(
      enShubhdin,     // ⬅️ ShubhDin localization
      enDasha         // ⬅️ Vimshottari Dasha localization
    )
  )
) as typeof core &
  typeof insights &
  typeof saturn &
  typeof daily &
  typeof enAbout &
  typeof enGuides &
  typeof enFaq &
  typeof enResultsPage &
  typeof enShubhdin &        // ⬅️ include type
  typeof enDasha;            // ⬅️ include type

export default en;
