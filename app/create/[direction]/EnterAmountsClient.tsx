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
  const [activeField, setActiveField] = useState<ActiveField>(
    direction === 'want-usd' ? 'need' : 'have',
  );
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
        hasCustomRate,
      };
    }
    return {
      title: 'I want XAF',
      direction: 'WANT_XAF' as const,
      haveCurrency: 'USD',
      needCurrency: 'XAF',
      rate,
      hasCustomRate,
    };
  }, [direction, desiredRate, rates]);

  const rateLabel = meta.hasCustomRate ? 'Requested rate' : 'Live rate';
  const secondaryLabel = activeField === 'need' ? 'You will pay' : 'You will receive';
  const secondaryCurrency = activeField === 'need' ? meta.haveCurrency : meta.needCurrency;

  const secondaryAmount = useMemo(() => {
    const rate = meta.rate;
    if (!Number.isFinite(rate) || rate <= 0) return '';

    if (activeField === 'need') {
      const need = Number(needAmount);
      if (!(need > 0)) return '';
      const value = meta.direction === 'WANT_USD' ? need * rate : need / rate;
      return value.toFixed(2);
    }

    const have = Number(haveAmount);
    if (!(have > 0)) return '';
    const value = meta.direction === 'WANT_USD' ? have / rate : have * rate;
    return value.toFixed(2);
  }, [activeField, haveAmount, needAmount, meta.direction, meta.rate]);

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
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-midnight/60">Enter Amounts</p>
        <h1 className="text-2xl font-black text-midnight">{meta.title}</h1>
        <p className="text-midnight/60">
          {loadingRates ? 'Loading rates...' : `${rateLabel} ${meta.rate} XAF per 1 USD`}
        </p>
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
          {activeField === 'have' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={haveAmount}
                  onChange={(e) => setHaveAmount(e.target.value)}
                  placeholder="Amount"
                  className="input"
                />
                <select className="input max-w-[90px]" value={meta.haveCurrency} disabled>
                  <option>{meta.haveCurrency}</option>
                </select>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-midnight/10 bg-midnight/5 px-3 py-2 text-sm font-semibold text-midnight/70">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm shadow-midnight/10">
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 text-midnight/70">
                    <path
                      fill="currentColor"
                      d="M4.5 6.5h9.19l-1.72-1.72a.75.75 0 0 1 1.06-1.06l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H4.5a.75.75 0 0 1 0-1.5Zm11 7h-9.19l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06l3-3a.75.75 0 1 1 1.06 1.06L6.31 12H15.5a.75.75 0 0 1 0 1.5Z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-widest text-midnight/50">{rateLabel}</span>
                  <span className="text-sm font-semibold text-midnight">{`${meta.rate} XAF = 1 USD`}</span>
                </div>
              </div>

              <div>
                <label className="label">{secondaryLabel}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={secondaryAmount}
                    readOnly
                    placeholder="Calculated amount"
                    className="input bg-midnight/5 text-midnight/80"
                  />
                  <select className="input max-w-[90px]" value={secondaryCurrency} disabled>
                    <option>{secondaryCurrency}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
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
          {activeField === 'need' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={needAmount}
                  onChange={(e) => setNeedAmount(e.target.value)}
                  placeholder="Amount"
                  className="input"
                />
                <select className="input max-w-[90px]" value={meta.needCurrency} disabled>
                  <option>{meta.needCurrency}</option>
                </select>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-midnight/10 bg-midnight/5 px-3 py-2 text-sm font-semibold text-midnight/70">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm shadow-midnight/10">
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 text-midnight/70">
                    <path
                      fill="currentColor"
                      d="M4.5 6.5h9.19l-1.72-1.72a.75.75 0 0 1 1.06-1.06l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H4.5a.75.75 0 0 1 0-1.5Zm11 7h-9.19l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06l3-3a.75.75 0 1 1 1.06 1.06L6.31 12H15.5a.75.75 0 0 1 0 1.5Z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-widest text-midnight/50">{rateLabel}</span>
                  <span className="text-sm font-semibold text-midnight">{`${meta.rate} XAF = 1 USD`}</span>
                </div>
              </div>

              <div>
                <label className="label">{secondaryLabel}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={secondaryAmount}
                    readOnly
                    placeholder="Calculated amount"
                    className="input bg-midnight/5 text-midnight/80"
                  />
                  <select className="input max-w-[90px]" value={secondaryCurrency} disabled>
                    <option>{secondaryCurrency}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="label">Desired rate (optional)</label>
          <p className="text-xs font-semibold text-midnight/50">Optional. Enter a different rate than the one shown above.</p>
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
