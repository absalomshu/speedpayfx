import { getRequestContext } from '@cloudflare/next-on-pages';
import { exportAll } from '../../../../lib/orders';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { env } = getRequestContext();
  const password = (env as Record<string, string | undefined>).ADMIN_PASSWORD;
  const provided = req.headers.get('x-admin-password');
  if (!password) {
    return Response.json({ error: 'Admin password not set' }, { status: 500 });
  }
  if (!provided || provided !== password) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await exportAll();
  return Response.json(payload);
}
