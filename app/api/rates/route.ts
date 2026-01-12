import { getRequestContext } from '@cloudflare/next-on-pages';
import { readRates, writeRates } from '../../../lib/orders';
import { maybeRefreshRates } from '../../../lib/rate-updater';
import type { Rates } from '../../../lib/types';

export const runtime = 'edge';

export async function GET() {
  try {
    const { rates } = await maybeRefreshRates();
    return Response.json(rates);
  } catch (err) {
    try {
      const rates = await readRates();
      return Response.json(rates);
    } catch (inner) {
      const message = inner instanceof Error ? inner.message : 'Unknown error';
      return Response.json({ error: message }, { status: 500 });
    }
  }
}

export async function POST(req: Request) {
  try {
    const { env } = getRequestContext();
    const password = (env as Record<string, string | undefined>).ADMIN_PASSWORD;
    const body = (await req.json().catch(() => null)) as Partial<Rates> & { password?: string } | null;
    if (!body || typeof body.password !== 'string') {
      return Response.json({ error: 'Missing admin password' }, { status: 401 });
    }
    if (!password || body.password !== password) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (typeof body.usd_to_xaf !== 'number' || typeof body.xaf_to_usd !== 'number') {
      return Response.json({ error: 'Invalid rate values' }, { status: 400 });
    }
    const updated = await writeRates({
      usd_to_xaf: body.usd_to_xaf,
      xaf_to_usd: body.xaf_to_usd,
      updated_at: new Date().toISOString(),
    });
    return Response.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
