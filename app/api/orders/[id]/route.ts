import { fetchOrder } from '../../../../lib/orders';

export const runtime = 'edge';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const order = await fetchOrder(id);
  if (!order) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  return Response.json(order);
}
