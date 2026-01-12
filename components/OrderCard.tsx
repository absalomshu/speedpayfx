import Link from 'next/link';
import type { Order } from '../lib/types';

export default function OrderCard({ order }: { order: Order }) {
  return (
    <Link href={`/orders/${order.id}`} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-midnight/60">Partner wants</p>
        <span className="rounded-full bg-midnight/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-midnight/70">{order.status}</span>
      </div>
      <p className="text-xl font-black text-midnight">
        {order.you_will_pay_amount.toLocaleString()} {order.you_will_pay_currency}
      </p>
      <p className="mt-1 text-sm text-midnight/70">Partner has: {order.partner_has_amount.toLocaleString()} {order.partner_has_currency}</p>
      <p className="mt-2 text-sm font-semibold text-midnight">{order.rate_display}</p>
      <p className="mt-2 text-sm text-midnight/80">
        You will pay {order.you_will_pay_amount.toLocaleString()} {order.you_will_pay_currency} → Receive {order.you_will_receive_amount.toLocaleString()} {order.you_will_receive_currency}
      </p>
    </Link>
  );
}
