// app/sitemap.ts
export default function sitemap() {
  const base = "https://goastrion.com";
  const now = new Date();

  // Main static pages
  const routes = [
    "/",             // home
    "/create",
    "/life-wheel",
    "/skills",
    "/faq",
    "/about",
    "/guides",
    "/saturn",
    "/vimshottari",
    "/daily",
    "/shubhdin",
    "/privacy",
    "/terms",
    "/disclaimer",
    "/contact",
  ];

  // Individual guide pages
  const guideSlugs = [
    "sade-sati",
    "dasha",
    "life-wheel",
    "career-astrology",
    "shubhdin",
    "balance",
  ];

  const guideRoutes = guideSlugs.map((slug) => `/guides/${slug}`);

  // Combine all pages
  const allRoutes = [...routes, ...guideRoutes];

  return allRoutes.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1.0 : 0.8,
  }));
}
