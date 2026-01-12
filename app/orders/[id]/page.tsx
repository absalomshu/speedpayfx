import Link from 'next/link';
import { fetchOrder } from '../../../lib/orders';
import type { Order } from '../../../lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

type CurrencyCode = 'USD' | 'XAF';

function FlagIcon({ code }: { code: CurrencyCode }) {
  const isUsd = code === 'USD';
  return (
    <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-sm bg-white">
      {isUsd ? (
        <svg aria-hidden="true" viewBox="0 0 24 16" className="h-3 w-4">
          <rect width="24" height="16" fill="#ffffff" />
          <rect width="24" height="2" y="0" fill="#b31942" />
          <rect width="24" height="2" y="4" fill="#b31942" />
          <rect width="24" height="2" y="8" fill="#b31942" />
          <rect width="24" height="2" y="12" fill="#b31942" />
          <rect width="9.6" height="7" x="0" y="0" fill="#0a3161" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 16" className="h-3 w-4">
          <rect width="8" height="16" x="0" y="0" fill="#007a5e" />
          <rect width="8" height="16" x="8" y="0" fill="#ce1126" />
          <rect width="8" height="16" x="16" y="0" fill="#fcd116" />
          <polygon points="12,5.2 12.9,7.5 15.3,7.5 13.3,8.9 14.1,11.1 12,9.7 9.9,11.1 10.7,8.9 8.7,7.5 11.1,7.5" fill="#fcd116" />
        </svg>
      )}
    </span>
  );
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ created?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const showCreatedNotice = resolvedSearchParams?.created === '1';
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
        <div className="flex flex-col gap-1">
          {showCreatedNotice && <p className="text-sm font-semibold text-midnight">Your order has been created</p>}
          <p className="text-sm font-semibold text-midnight/80">
            <span className="text-xs uppercase tracking-wide text-midnight/60">Order ID</span>{' '}
            <span className="truncate">{order.id}</span>
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-midnight/60">Partner wants</p>
            <p className="text-2xl font-black text-midnight">
              {order.you_will_pay_amount.toLocaleString()}{' '}
              <span className="inline-flex items-center gap-2">
                <FlagIcon code={order.you_will_pay_currency as CurrencyCode} />
                <span>{order.you_will_pay_currency}</span>
              </span>
            </p>
          </div>
          <span className="rounded-full bg-midnight/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-midnight/70">{order.status}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-midnight/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-midnight/60">You will receive</p>
            <p className="text-lg font-bold text-midnight">{order.you_will_receive_amount.toLocaleString()} {order.you_will_receive_currency}</p>
          </div>
        </div>
        <p className="text-sm font-semibold text-midnight">{order.rate_display}</p>
        <p className="text-xs uppercase tracking-wide text-midnight/60">
          Created: {new Date(order.created_at).toLocaleString('en-US', { timeZone: 'America/New_York', timeZoneName: 'short' })}
        </p>
      </div>

    </main>
  );
}
