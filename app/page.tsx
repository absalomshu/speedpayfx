import Link from 'next/link';
import { FontSizeToggle } from '../components/FontSizeToggle';
import { maybeRefreshRates } from '../lib/rate-updater';
import type { Rates } from '../lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

type CurrencyCode = 'USD' | 'XAF';

const formatRate = (value: number) => (Number.isFinite(value) ? value.toFixed(2) : '—');

function FlagIcon({ code }: { code: CurrencyCode }) {
  const isUsd = code === 'USD';
  return (
    <span className="flex h-4 w-4 items-center justify-center overflow-hidden">
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

function ExchangeIcon() {
  return (
    <span className="flex h-6 w-6 items-center justify-center">
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5 text-midnight/70">
        <path
          fill="currentColor"
          d="M4 10a.75.75 0 0 1 .75-.75h8.69l-1.97-1.97a.75.75 0 0 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 1 1-1.06-1.06l1.97-1.97H4.75A.75.75 0 0 1 4 10Z"
        />
      </svg>
    </span>
  );
}

export default async function HomePage() {
  const { rates }: { rates: Rates } = await maybeRefreshRates();

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-5 py-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black leading-tight text-midnight">USD and XAF Exchange</h1>
          <p className="text-base text-midnight/70">Peer matching for USD and XAF trades.</p>
        </div>
        <div className="pt-1">
          <FontSizeToggle />
        </div>
      </header>

      <section className="card p-5">
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-lg font-bold text-midnight">Exchange Rates</h2>
          <span className="rounded-full bg-midnight/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-midnight/70">Live</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1 rounded-xl bg-midnight/5 px-4 py-3 shadow-inner shadow-midnight/5">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-midnight/60">
              <span className="inline-flex items-center gap-1.5">
                <FlagIcon code="XAF" />
                <span>XAF</span>
              </span>
              <ExchangeIcon />
              <span className="inline-flex items-center gap-1.5">
                <FlagIcon code="USD" />
                <span>USD</span>
              </span>
            </p>
            <p className="text-2xl font-black text-midnight">{formatRate(rates.xaf_to_usd)} XAF = 1 USD </p>
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-midnight/5 px-4 py-3 shadow-inner shadow-midnight/5">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-midnight/60">
              <span className="inline-flex items-center gap-1.5">
                <FlagIcon code="USD" />
                <span>USD</span>
              </span>
              <ExchangeIcon />
              <span className="inline-flex items-center gap-1.5">
                <FlagIcon code="XAF" />
                <span>XAF</span>
              </span>
            </p>
            <p className="text-2xl font-black text-midnight">1 USD = {formatRate(rates.usd_to_xaf)} XAF</p>
          </div>
        </div>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-midnight/60">
          Last updated: {new Date(rates.updated_at).toLocaleString('en-US', { timeZone: 'America/New_York', timeZoneName: 'short' })}
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/create" className="btn text-center text-lg">Create Order</Link>
        <Link href="/orders" className="btn text-center text-lg">Browse Orders</Link>
      </div>
    </main>
  );
}
