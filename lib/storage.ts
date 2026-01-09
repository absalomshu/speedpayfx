import { getRequestContext } from '@cloudflare/next-on-pages';

export type Storage = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
  delete: (key: string) => Promise<void>;
  list: (options?: { prefix?: string }) => Promise<{ keys: { name: string }[] }>;
};

/**
 * Returns the active storage layer.
 * - On Cloudflare Pages: uses the bound KV namespace (FX_KV).
 * - Locally (no binding): falls back to a simple file-backed store.
 */
export async function getStorage(): Promise<Storage> {
  try {
    const { env } = getRequestContext();
    const kv = (env as Record<string, unknown> | undefined)?.FX_KV as Storage | undefined;
    if (!kv) {
      throw new Error('KV binding FX_KV missing');
    }
    return kv;
  } catch (err) {
    // Local dev fallback: only use when not in production and no binding is available.
    if (process.env.NODE_ENV === 'production') {
      throw err instanceof Error ? err : new Error('KV unavailable');
    }
    return createFileStorage();
  }
}

async function createFileStorage(): Promise<Storage> {
  const fs = await (Function('return import("node:fs/promises")')() as Promise<
    typeof import('node:fs/promises')
  >);
  const path = await (Function('return import("node:path")')() as Promise<typeof import('node:path')>);
  const dataDir = path.join(process.cwd(), '.data');
  const dataFile = path.join(dataDir, 'kv.json');

  const readStore = async (): Promise<Record<string, string>> => {
    try {
      const raw = await fs.readFile(dataFile, 'utf8');
      return JSON.parse(raw) as Record<string, string>;
    } catch {
      return {};
    }
  };

  const writeStore = async (data: Record<string, string>) => {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8');
  };

  return {
    async get(key) {
      const store = await readStore();
      return store[key] ?? null;
    },
    async put(key, value) {
      const store = await readStore();
      store[key] = value;
      await writeStore(store);
    },
    async delete(key) {
      const store = await readStore();
      delete store[key];
      await writeStore(store);
    },
    async list(options) {
      const store = await readStore();
      const prefix = options?.prefix ?? '';
      const keys = Object.keys(store)
        .filter((name) => name.startsWith(prefix))
        .map((name) => ({ name }));
      return { keys };
    },
  };
}
