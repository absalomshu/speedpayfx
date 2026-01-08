import { matchOrder } from '../../../../../lib/orders';

export const runtime = 'edge';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const updated = await matchOrder(id);
  if (!updated) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  return Response.json(updated);
}
