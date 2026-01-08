import { getRequestContext } from '@cloudflare/next-on-pages';

export const getKV = () => {
  const { env } = getRequestContext();
  const binding = (env as Record<string, unknown> | undefined)?.FX_KV;
  if (!binding) {
    throw new Error('KV binding FX_KV missing');
  }
  return binding as KVNamespace;
};

export type KVNamespace = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
  delete: (key: string) => Promise<void>;
  list: (options?: { prefix?: string }) => Promise<{ keys: { name: string }[] }>;
};
