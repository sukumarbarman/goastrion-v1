// app/life-wheel/head.tsx
export default function Head() {
  return (
    <>
      <title>
        Life Wheel – Career, Finance, Relationships & Life Domains | GoAstrion
      </title>

      <meta
        name="description"
        content="Explore your personalized Life Wheel: career, finance, relationships, opportunities, challenges, strengths, and planetary influences based on your Vedic birth chart."
      />

      {/* Canonical URL */}
      <link rel="canonical" href="https://goastrion.com/life-wheel" />

      {/* OpenGraph */}
      <meta
        property="og:title"
        content="Life Wheel – Vedic Astrology Domains | GoAstrion"
      />
      <meta
        property="og:description"
        content="Understand your strengths and challenges across 12 domains — career, money, education, relationships, and more — powered by Vedic astrology."
      />
      <meta property="og:url" content="https://goastrion.com/life-wheel" />
      <meta property="og:site_name" content="GoAstrion" />
      <meta
        property="og:image"
        content="https://goastrion.com/og/life-wheel.jpg"
      />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en-IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="Life Wheel – Vedic Astrology Domains | GoAstrion"
      />
      <meta
        name="twitter:description"
        content="Review your top life domains and planetary influences based on your Vedic birth chart."
      />
      <meta
        name="twitter:image"
        content="https://goastrion.com/og/life-wheel.jpg"
      />
    </>
  );
}
