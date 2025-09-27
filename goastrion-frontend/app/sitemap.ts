// Minimal static list. Add your real routes.
export default function sitemap() {
  const base = "https://goastrion.com";
  const routes = ["", "/career-guidance", "/finance", "/marriage", "/health"];
  const now = new Date();

  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: r === "" ? 1.0 : 0.8,
  }));
}
