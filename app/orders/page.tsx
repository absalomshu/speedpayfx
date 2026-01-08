import Link from 'next/link';
import OrderCard from '../../components/OrderCard';
import { listOpenOrders } from '../../lib/orders';
import type { Order } from '../../lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default async function OrdersPage() {
  const orders: Order[] = await listOpenOrders();

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 py-8">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold uppercase tracking-widest text-midnight/60">Browse Orders</p>
          <h1 className="text-2xl font-black text-midnight">Open matches</h1>
        </div>
        <Link href="/create" className="btn text-sm">Create Order</Link>
      </header>

      {orders.length === 0 ? (
        <div className="card p-5 text-center text-midnight/70">No open orders yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </main>
  );
}
