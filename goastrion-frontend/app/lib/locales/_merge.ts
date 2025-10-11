type PlainObject = Record<string, unknown>;

function isPlainObject(v: unknown): v is PlainObject {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge objects; copies arrays; no `any` leaks */
export function deepMerge<T extends PlainObject, U extends PlainObject>(a: T, b: U): T & U {
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
