import { getRequestContext } from '@cloudflare/next-on-pages';
import { importAll } from '../../../../lib/orders';
import type { Order, Rates } from '../../../../lib/types';

export const runtime = 'edge';

type ImportPayload = {
  rates: Rates;
  orders_index: string[];
  orders: Record<string, Order>;
};

export async function POST(req: Request) {
  const { env } = getRequestContext();
  const password = (env as Record<string, string | undefined>).ADMIN_PASSWORD;
  const provided = req.headers.get('x-admin-password');
  if (!password || !provided || provided !== password) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as ImportPayload | null;
  if (!body || !body.rates || !body.orders_index || !body.orders) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 });
  }
  await importAll(body);
  return Response.json({ status: 'ok' });
}
