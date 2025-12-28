// app/lib/backend.ts

export function backend(): string {
  const raw = process.env.BACKEND_URL;

  if (!raw) {
    throw new Error("BACKEND_URL is not defined. Set it in the environment.");
  }

  return raw.replace(/\/+$/, "");
}
