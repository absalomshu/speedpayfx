'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { Rates } from '../../../lib/types';

type ActiveField = 'have' | 'need';

const initialRates: Rates = {
  usd_to_xaf: 570,
  xaf_to_usd: 600,
  updated_at: new Date().toISOString(),
};

type Props = {
  direction: 'want-usd' | 'want-xaf';
};

export default function EnterAmountsClient({ direction }: Props) {
  const router = useRouter();
  const [rates, setRates] = useState<Rates>(initialRates);
  const [loadingRates, setLoadingRates] = useState(true);
  const [haveAmount, setHaveAmount] = useState('');
  const [needAmount, setNeedAmount] = useState('');
  const [desiredRate, setDesiredRate] = useState('');
  const [activeField, setActiveField] = useState<ActiveField>('have');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const meta = useMemo(() => {
    const desired = Number(desiredRate);
    const hasCustomRate = desiredRate.trim().length > 0 && Number.isFinite(desired) && desired > 0;
    const fallbackRate = direction === 'want-usd' ? rates.xaf_to_usd : rates.usd_to_xaf;
    const rate = hasCustomRate ? desired : fallbackRate;

    if (direction === 'want-usd') {
      return {
        title: 'I want USD',
        direction: 'WANT_USD' as const,
        haveCurrency: 'XAF',
        needCurrency: 'USD',
        rate,
      };
    }
    return {
      title: 'I want XAF',
      direction: 'WANT_XAF' as const,
      haveCurrency: 'USD',
      needCurrency: 'XAF',
      rate,
    };
  }, [direction, desiredRate, rates]);

  useEffect(() => {
    fetch('/api/rates')
      .then((res) => res.json())
      .then((data: Rates) => setRates(data))
      .catch(() => {})
      .finally(() => setLoadingRates(false));
  }, []);

  const computeAmounts = () => {
    const rate = meta.rate;
    const have = Number(haveAmount);
    const need = Number(needAmount);

    if (!Number.isFinite(rate) || rate <= 0) {
      return { error: 'Rate is invalid' };
    }

    if (activeField === 'have') {
      if (!(have > 0)) return { error: 'Enter an amount for "I have".' };
      if (meta.direction === 'WANT_USD') {
        return { haveAmount: have, needAmount: Number((have / rate).toFixed(2)) };
      }
      return { haveAmount: have, needAmount: Number((have * rate).toFixed(2)) };
    }

    if (!(need > 0)) return { error: 'Enter an amount for "I need".' };
    if (meta.direction === 'WANT_USD') {
      return { haveAmount: Number((need * rate).toFixed(2)), needAmount: need };
    }
    return { haveAmount: Number((need / rate).toFixed(2)), needAmount: need };
  };

  const handleSubmit = async () => {
    setError('');
    const result = computeAmounts();
    if ('error' in result) {
      setError(result.error || 'Invalid input');
      return;
    }

    setSubmitting(true);
    const payload = {
      direction: meta.direction,
      partner_has_amount: result.haveAmount,
      partner_has_currency: meta.haveCurrency,
      partner_wants_currency: meta.needCurrency,
      desired_rate_xaf_per_usd: desiredRate ? Number(desiredRate) : null,
      rate_display: `Rate: ${meta.rate} XAF = 1 USD`,
      you_will_pay_amount: result.needAmount,
      you_will_pay_currency: meta.needCurrency,
      you_will_receive_amount: result.haveAmount,
      you_will_receive_currency: meta.haveCurrency,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to create order');
      }
      const order = await res.json();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 py-8">
      <div className="flex items-center gap-2 text-sm text-midnight/70">
        <Link href="/create" className="font-semibold text-midnight">Back</Link>
        <span className="text-midnight/40">/</span>
        <span>{meta.title}</span>
      </div>

      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-midnight/60">Enter Amounts</p>
        <h1 className="text-2xl font-black text-midnight">{meta.title}</h1>
        <p className="text-midnight/60">{loadingRates ? 'Loading rates...' : `Using rate ${meta.rate} XAF per 1 USD`}</p>
      </header>

      <div className="card flex flex-col gap-4 p-5">
        <div>
          <label className="label flex items-center gap-2">
            <input
              type="radio"
              name="field"
              checked={activeField === 'have'}
              onChange={() => setActiveField('have')}
              className="h-4 w-4"
            />
            <span>I have</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={haveAmount}
              onChange={(e) => setHaveAmount(e.target.value)}
              placeholder="Amount"
              className="input"
              disabled={activeField !== 'have'}
            />
            <select className="input max-w-[90px]" value={meta.haveCurrency} disabled>
              <option>{meta.haveCurrency}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <input
              type="radio"
              name="field"
              checked={activeField === 'need'}
              onChange={() => setActiveField('need')}
              className="h-4 w-4"
            />
            <span>I need</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={needAmount}
              onChange={(e) => setNeedAmount(e.target.value)}
              placeholder="Amount"
              className="input"
              disabled={activeField !== 'need'}
            />
            <select className="input max-w-[90px]" value={meta.needCurrency} disabled>
              <option>{meta.needCurrency}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Desired rate (optional)</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={desiredRate}
              onChange={(e) => setDesiredRate(e.target.value)}
              placeholder={`${meta.rate}`}
              className="input"
            />
            <span className="text-sm font-semibold text-midnight/70">XAF per 1 USD</span>
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn flex items-center justify-center text-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Next'}
        </button>
      </div>
    </main>
  );
}
