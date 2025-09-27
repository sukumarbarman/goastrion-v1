// app/lib/locales/hi.ts
import core from "./hi-core";
import insights from "./hi-insights";

type PlainObject = Record<string, unknown>;

function isPlainObject(v: unknown): v is PlainObject {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// tiny deep merge that preserves objects/arrays (no `any`)
function deepMerge<T extends PlainObject, U extends PlainObject>(a: T, b: U): T & U {
  const out: PlainObject = isPlainObject(a) ? { ...a } : {};

  for (const [k, v] of Object.entries(b)) {
    const cur = (out as PlainObject)[k];

    if (isPlainObject(v) && isPlainObject(cur)) {
      (out as PlainObject)[k] = deepMerge(cur, v);
    } else if (Array.isArray(v)) {
      (out as PlainObject)[k] = [...v];
    } else {
      (out as PlainObject)[k] = v;
    }
  }

  return out as T & U;
}

const hi = deepMerge(core, insights) as typeof core & typeof insights;
export default hi;
