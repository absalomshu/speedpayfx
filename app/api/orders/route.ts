import { createOrder, listOpenOrders } from '../../../lib/orders';
import type { Order } from '../../../lib/types';

export const runtime = 'edge';

export async function GET() {
  const orders = await listOpenOrders();
  return Response.json(orders);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<Order> | null;
  if (!body) {
    return Response.json({ error: 'Invalid body' }, { status: 400 });
  }
  const required = [
    'direction',
    'partner_has_amount',
    'partner_has_currency',
    'partner_wants_currency',
    'rate_display',
    'you_will_pay_amount',
    'you_will_pay_currency',
    'you_will_receive_amount',
    'you_will_receive_currency',
  ] as const;

  for (const key of required) {
    if ((body as Record<string, unknown>)[key] === undefined) {
      return Response.json({ error: `Missing field: ${key}` }, { status: 400 });
    }
  }

  const desiredRate = body.desired_rate_xaf_per_usd ?? null;
  const recordInput = {
    direction: body.direction as Order['direction'],
    partner_has_amount: Number(body.partner_has_amount),
    partner_has_currency: body.partner_has_currency as Order['partner_has_currency'],
    partner_wants_currency: body.partner_wants_currency as Order['partner_wants_currency'],
    desired_rate_xaf_per_usd: desiredRate === null ? null : Number(desiredRate),
    rate_display: String(body.rate_display),
    you_will_pay_amount: Number(body.you_will_pay_amount),
    you_will_pay_currency: body.you_will_pay_currency as Order['you_will_pay_currency'],
    you_will_receive_amount: Number(body.you_will_receive_amount),
    you_will_receive_currency: body.you_will_receive_currency as Order['you_will_receive_currency'],
  } satisfies Omit<Order, 'id' | 'created_at' | 'status'>;

  const numbers = [recordInput.partner_has_amount, recordInput.you_will_pay_amount, recordInput.you_will_receive_amount];
  if (numbers.some((n) => !Number.isFinite(n) || n <= 0)) {
    return Response.json({ error: 'Amounts must be positive numbers' }, { status: 400 });
  }

  const created = await createOrder(recordInput);
  return Response.json(created, { status: 201 });
}
