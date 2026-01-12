import Link from 'next/link';
import MatchOrderButton from '../../../components/MatchOrderButton';
import { fetchOrder } from '../../../lib/orders';
import type { Order } from '../../../lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  let order: Order | null = null;
  try {
    const resolved = await params;
    order = await fetchOrder(resolved.id);
  } catch (err) {
    order = null;
  }

  if (!order) {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 py-8">
        <Link href="/orders" className="text-sm font-semibold text-midnight">← Back to orders</Link>
        <div className="card p-6 text-center text-midnight/70">Order not found.</div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 py-8">
      <div className="card flex flex-col gap-4 p-6">
        <div className="rounded-xl border border-midnight/10 bg-midnight/5 px-4 py-3">
          <p className="text-sm font-semibold text-midnight">Your order has been created</p>
          <p className="text-xs uppercase tracking-wide text-midnight/60">Order ID</p>
          <p className="text-sm font-semibold text-midnight/80">{order.id}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-midnight/60">Partner has</p>
            <p className="text-2xl font-black text-midnight">
              {order.partner_has_amount.toLocaleString()} {order.partner_has_currency}
            </p>
          </div>
          <span className="rounded-full bg-midnight/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-midnight/70">{order.status}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-midnight/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-midnight/60">Partner wants</p>
            <p className="text-lg font-bold text-midnight">{order.you_will_pay_amount.toLocaleString()} {order.you_will_pay_currency}</p>
          </div>
          <div className="rounded-xl bg-midnight/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-midnight/60">You will receive</p>
            <p className="text-lg font-bold text-midnight">{order.you_will_receive_amount.toLocaleString()} {order.you_will_receive_currency}</p>
          </div>
        </div>
        <p className="text-sm font-semibold text-midnight">{order.rate_display}</p>
        <p className="text-xs uppercase tracking-wide text-midnight/60">Created: {new Date(order.created_at).toLocaleString()}</p>
      </div>

      <MatchOrderButton orderId={order.id} initialStatus={order.status} />
    </main>
  );
}
