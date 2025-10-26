type PlainObject = Record<string, unknown>;

function isPlainObject(v: unknown): v is PlainObject {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge objects; copies arrays; **does not overwrite arrays with non-arrays** */
export function deepMerge<T extends PlainObject, U extends PlainObject>(a: T, b: U): T & U {
  const out: PlainObject = isPlainObject(a) ? { ...a } : {};
  for (const [k, v] of Object.entries(b)) {
    const cur = (out as PlainObject)[k];

    if (isPlainObject(v) && isPlainObject(cur)) {
      (out as PlainObject)[k] = deepMerge(cur as PlainObject, v as PlainObject);
      continue;
    }

    // ✅ keep existing arrays if incoming isn't an array
    if (Array.isArray(cur) && !Array.isArray(v)) {
      continue;
    }

    if (Array.isArray(v)) {
      (out as PlainObject)[k] = [...v];
    } else {
      (out as PlainObject)[k] = v;
    }
  }
  return out as T & U;
}
