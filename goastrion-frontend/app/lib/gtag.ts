// app/types/gtag.d.ts
export {};

declare global {
  type GtagTransport = "beacon" | "xhr" | "image";

  interface GtagConfig {
    page_path?: string;
    anonymize_ip?: boolean;
    transport_type?: GtagTransport;
    [key: string]: unknown;
  }

  type GtagCommand =
    | ["js", Date]
    | ["config", string, GtagConfig?]
    | ["event", string, Record<string, unknown>?];

  interface Window {
    dataLayer: unknown[];
    gtag: (...args: GtagCommand) => void;
  }
}
