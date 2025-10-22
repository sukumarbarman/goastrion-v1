// goastrion-frontend/app/lib/astroEndpoints.ts
export const ASTRO_ENDPOINTS = {
  charts: "/api/astro/charts/",       // matches astro/urls.py: "charts/"
  chartById: (id: number | string) => `/api/astro/charts/${id}/`,
} as const;
