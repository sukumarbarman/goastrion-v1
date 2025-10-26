//goastrion-frontend/app/shubhdin/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
      <div className="font-semibold mb-1">Couldn’t load ShubhDin.</div>
      <div className="text-sm opacity-80">{error.message}</div>
      <button
        onClick={reset}
        className="mt-3 rounded-md bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
      >
        Try again
      </button>
    </div>
  );
}
