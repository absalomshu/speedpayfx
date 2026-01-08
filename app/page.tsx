import Link from 'next/link';
import { readRates } from '../lib/orders';
import type { Rates } from '../lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default async function HomePage() {
  const rates: Rates = await readRates();

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-5 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black leading-tight text-midnight">Match USD and XAF in seconds</h1>
        <p className="text-base text-midnight/70">Peer matching for USD and XAF trades. Transparent rates, fast confirmations.</p>
      </header>

      <section className="card p-5">
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-lg font-bold text-midnight">Exchange Rates</h2>
          <span className="rounded-full bg-midnight/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-midnight/70">Live</span>
        </div>
        <div className="grid grid-cols-1 gap-4 rounded-xl bg-midnight/5 px-4 py-3 shadow-inner shadow-midnight/5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-midnight/60">USD to XAF</p>
            <p className="text-2xl font-black text-midnight">1 USD = {rates.usd_to_xaf} XAF</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-midnight/60">XAF to USD</p>
            <p className="text-2xl font-black text-midnight">{rates.xaf_to_usd} XAF = 1 USD </p>
          </div>
        </div>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-midnight/60">
          Last updated: {new Date(rates.updated_at).toLocaleString()}
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/create" className="btn text-center text-lg">Create Order</Link>
        <Link href="/orders" className="btn bg-white text-midnight ring-1 ring-midnight/15 hover:bg-sand">Browse Orders</Link>
      </div>
    </main>
  );
}
