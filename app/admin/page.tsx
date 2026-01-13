'use client';

import { useEffect, useState } from 'react';

type RateConfig = {
  interval_minutes: number;
  offset_xaf: number;
  last_checked_at: string | null;
  spread_xaf: number;
};

type Rates = {
  usd_to_xaf: number;
  xaf_to_usd: number;
  updated_at: string;
};

type NalaRates = {
  usd_to_xaf: number;
  xaf_to_usd: number;
};

type ConfigResponse = {
  config: RateConfig;
  rates: Rates;
  nala_rates: NalaRates | null;
  nala_error: string | null;
};

const formatTime = (value: string | null) => {
  if (!value) return 'Never';
  return new Date(value).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  });
};

export default function AdminPage() {
  const [intervalMinutes, setIntervalMinutes] = useState('120');
  const [offsetXaf, setOffsetXaf] = useState('2');
  const [spreadXaf, setSpreadXaf] = useState('15');
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<string | null>(null);
  const [currentUsdToXaf, setCurrentUsdToXaf] = useState<number | null>(null);
  const [currentXafToUsd, setCurrentXafToUsd] = useState<number | null>(null);
  const [nalaUsdToXaf, setNalaUsdToXaf] = useState<number | null>(null);
  const [nalaXafToUsd, setNalaXafToUsd] = useState<number | null>(null);
  const [nalaError, setNalaError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    setStatus('Loading...');
    try {
      const res = await fetch('/api/admin/rates/config');
      const data = (await res.json().catch(() => null)) as ConfigResponse | { error?: string } | null;
      if (!res.ok) {
        setStatus(data && 'error' in data && data.error ? data.error : 'Failed to load settings.');
        return;
      }
      if (!data || !('config' in data)) {
        setStatus('Invalid response from server.');
        return;
      }
      setIntervalMinutes(String(data.config.interval_minutes));
      setOffsetXaf(String(data.config.offset_xaf));
      setSpreadXaf(String(data.config.spread_xaf ?? 15));
      setLastCheckedAt(data.config.last_checked_at);
      setRatesUpdatedAt(data.rates.updated_at);
      setCurrentUsdToXaf(data.rates.usd_to_xaf);
      setCurrentXafToUsd(data.rates.xaf_to_usd);
      setNalaUsdToXaf(data.nala_rates?.usd_to_xaf ?? null);
      setNalaXafToUsd(data.nala_rates?.xaf_to_usd ?? null);
      setNalaError(data.nala_error);
      setStatus('Settings loaded.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async () => {
    if (!(Number(spreadXaf) >= 0)) {
      setStatus('Enter a valid XAF spread.');
      return;
    }
    setLoading(true);
    setStatus('Saving...');
    try {
      const res = await fetch('/api/admin/rates/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interval_minutes: Number(intervalMinutes),
          offset_xaf: Number(offsetXaf),
          spread_xaf: Number(spreadXaf),
        }),
      });
      const data = (await res.json().catch(() => null)) as { config?: RateConfig; error?: string } | null;
      if (!res.ok) {
        setStatus(data?.error ?? 'Failed to save settings.');
        return;
      }
      if (data?.config) {
        setIntervalMinutes(String(data.config.interval_minutes));
        setOffsetXaf(String(data.config.offset_xaf));
        setSpreadXaf(String(data.config.spread_xaf ?? 15));
        setLastCheckedAt(data.config.last_checked_at);
      }
      setStatus('Settings saved.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-midnight/60">Admin</p>
        <h1 className="text-2xl font-black text-midnight">Rate Update Settings</h1>
        <p className="text-sm text-midnight/60">
          Rates pull from Nala when the change exceeds the configured offset.
        </p>
      </header>

      <div className="card flex flex-col gap-4 p-5">
        <div className="rounded-2xl border border-midnight/10 bg-midnight/5 p-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-midnight/60">Current Nala rates</p>
          {nalaError && <p className="mt-2 text-sm font-semibold text-midnight">{nalaError}</p>}
          {!nalaError && (
            <div className="mt-3">
              <div className="rounded-xl border border-midnight/10 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-midnight/50">USD → XAF</p>
                <p className="text-lg font-semibold text-midnight">
                  {nalaUsdToXaf ?? '—'} XAF
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Update interval (minutes)</label>
            <input
              type="number"
              min="5"
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Change threshold (XAF)</label>
            <input
              type="number"
              min="0"
              value={offsetXaf}
              onChange={(e) => setOffsetXaf(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label">XAF spread (adds to USD → XAF)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={spreadXaf}
              onChange={(e) => setSpreadXaf(e.target.value)}
              className="input"
              placeholder="Enter spread amount"
            />
            <p className="mt-2 text-sm font-semibold text-midnight/70">
              Local USD → XAF: {currentUsdToXaf ?? '—'} XAF
            </p>
            <p className="text-sm font-semibold text-midnight/70">
              Local XAF → USD: {currentXafToUsd ?? '—'} XAF
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={loadSettings} className="btn" disabled={loading}>
            Refresh
          </button>
          <button onClick={saveSettings} className="btn" disabled={loading}>
            Save settings
          </button>
        </div>

        <div className="text-sm text-midnight/70">
          <p>Last checked: {formatTime(lastCheckedAt)}</p>
          <p>Rates updated: {formatTime(ratesUpdatedAt)}</p>
        </div>

        {status && <p className="text-sm font-semibold text-midnight">{status}</p>}
      </div>
    </main>
  );
}
