const normalizeBase = (input?: string) => {
  if (!input) return undefined;
  if (input.startsWith('http')) return input.replace(/\/$/, '');
  return `https://${input.replace(/\/$/, '')}`;
};

export const getBaseUrl = () => {
  return (
    normalizeBase(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeBase(process.env.CF_PAGES_URL) ||
    normalizeBase(process.env.VERCEL_URL) ||
    'http://127.0.0.1:8788'
  );
};

export async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${getBaseUrl()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}
