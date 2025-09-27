// app/sitemap.ts
export default function sitemap() {
  const base = "https://goastrion.com";
  const now = new Date();

  // ✅ Include only real, deployed routes
  const routes: string[] = [
    "",          // /
    // "/faq",   // uncomment only if /faq page exists
    // add more routes here as you create them
  ];

  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: r === "" ? 1.0 : 0.8,
  }));
}
