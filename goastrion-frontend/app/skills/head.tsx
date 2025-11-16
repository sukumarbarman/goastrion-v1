// app/skills/head.tsx
export default function Head() {
  return (
    <>
      <title>
        Skills – Strengths, Talents & Planetary Indicators | GoAstrion
      </title>

      <meta
        name="description"
        content="Discover your strongest Vedic astrology skills based on planetary placements, chip indicators, and strength scores. Explore how planets influence your talents, abilities, and life direction."
      />

      {/* Canonical */}
      <link rel="canonical" href="https://goastrion.com/skills" />

      {/* OpenGraph */}
      <meta property="og:title" content="Skills – Vedic Astrology Strengths | GoAstrion" />
      <meta
        property="og:description"
        content="Understand your top strengths, talents, and capabilities based on planetary influences and skill mapping from your birth chart."
      />
      <meta property="og:url" content="https://goastrion.com/skills" />
      <meta property="og:site_name" content="GoAstrion" />
      <meta
        property="og:image"
        content="https://goastrion.com/og/skills.jpg"
      />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en-IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="Skills – Vedic Astrology Strengths | GoAstrion"
      />
      <meta
        name="twitter:description"
        content="Explore your astrology-based skills and abilities derived from your planetary placements."
      />
      <meta
        name="twitter:image"
        content="https://goastrion.com/og/skills.jpg"
      />
    </>
  );
}
