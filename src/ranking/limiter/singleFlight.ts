// singleflight.ts
const inflight = new Map<string, Promise<any>>();

export function coalesce<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (inflight.has(key)) return inflight.get(key) as Promise<T>;

  const p = (async () => {
    try {
      return await fn();
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
  return p;
}
