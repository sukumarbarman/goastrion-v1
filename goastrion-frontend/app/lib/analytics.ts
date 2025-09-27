// app/lib/analytics.ts
export type GenerateChartClickParams = {
  source?: "create_page" | "quick_start" | "other";
  tz?: "IST" | "UTC" | string;
};

export type GenerateChartRequestParams = {
  lat?: number;
  lon?: number;
  has_place?: boolean;
  tz?: string;
  source?: string;
};

export type GenerateChartSuccessParams = {
  duration_ms: number;
  lagna_sign?: string;
  houses_highlighted?: number;
  source?: string;
};

export type GenerateChartErrorParams = {
  error_code?: string;
  duration_ms?: number;
  source?: string;
};

function gtagEvent(action: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_GA_ID) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", action, params);
}

export function trackGenerateChartClick(params: GenerateChartClickParams = {}) {
  gtagEvent("generate_chart_click", params);
}

export function trackGenerateChartRequest(params: GenerateChartRequestParams = {}) {
  gtagEvent("generate_chart_request", params);
}

export function trackGenerateChartSuccess(params: GenerateChartSuccessParams) {
  gtagEvent("generate_chart_success", params);
}

export function trackGenerateChartError(params: GenerateChartErrorParams = {}) {
  gtagEvent("generate_chart_error", params);
}
