// app/sitemap.ts
export default function sitemap() {
  const base = "https://goastrion.com";
  const now = new Date();

  const routes = [
    "/",             // home
    "/create",
    "/domains",
    "/skills",
    "/faq",
    "/about",
    "/guides",
    "/saturn",
    "/dasha",
    "/daily",
    "/shubhdin",
    "/privacy",
    "/terms",
    "/disclaimer",
    "/contact",
  ];

  return routes.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1.0 : 0.8,
  }));
}
