import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getRequestContext();
    const kv = (env as Record<string, unknown> | undefined)?.FX_KV as
      | { get: (key: string) => Promise<string | null> }
      | undefined;

    const hasKv = Boolean(kv);
    let kvGetRates = false;

    if (kv) {
      try {
        await kv.get('rates');
        kvGetRates = true;
      } catch {
        kvGetRates = false;
      }
    }

    return Response.json({ ok: true, hasKv, kvGetRates });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
