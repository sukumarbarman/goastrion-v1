export default function Field({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-300 mb-1">{label}</div>
      <input placeholder={placeholder} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-slate-200" />
    </label>
  );
}
