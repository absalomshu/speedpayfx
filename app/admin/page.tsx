'use client';

import { useState } from 'react';

type RateConfig = {
  interval_minutes: number;
  offset_xaf: number;
  last_checked_at: string | null;
  usd_to_xaf_mode: 'auto' | 'manual';
  usd_to_xaf_manual: number | null;
  xaf_to_usd_mode: 'auto' | 'manual';
  xaf_to_usd_manual: number | null;
};

type Rates = {
  usd_to_xaf: number;
  xaf_to_usd: number;
  updated_at: string;
};

type ConfigResponse = {
  config: RateConfig;
  rates: Rates;
};

const formatTime = (value: string | null) => {
  if (!value) return 'Never';
  return new Date(value).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  });
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState('120');
  const [offsetXaf, setOffsetXaf] = useState('2');
  const [usdMode, setUsdMode] = useState<'auto' | 'manual'>('auto');
  const [usdManual, setUsdManual] = useState('');
  const [xafMode, setXafMode] = useState<'auto' | 'manual'>('auto');
  const [xafManual, setXafManual] = useState('');
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<string | null>(null);
  const [currentUsdToXaf, setCurrentUsdToXaf] = useState<number | null>(null);
  const [currentXafToUsd, setCurrentXafToUsd] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const loadSettings = async () => {
    if (!password) {
      setStatus('Enter the admin password to load settings.');
      return;
    }
    setLoading(true);
    setStatus('Loading...');
    try {
      const res = await fetch('/api/admin/rates/config', {
        headers: { 'x-admin-password': password },
      });
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
      setUsdMode(data.config.usd_to_xaf_mode ?? 'auto');
      setUsdManual(
        typeof data.config.usd_to_xaf_manual === 'number'
          ? String(data.config.usd_to_xaf_manual)
          : '',
      );
      setXafMode(data.config.xaf_to_usd_mode ?? 'auto');
      setXafManual(
        typeof data.config.xaf_to_usd_manual === 'number'
          ? String(data.config.xaf_to_usd_manual)
          : '',
      );
      setLastCheckedAt(data.config.last_checked_at);
      setRatesUpdatedAt(data.rates.updated_at);
      setCurrentUsdToXaf(data.rates.usd_to_xaf);
      setCurrentXafToUsd(data.rates.xaf_to_usd);
      setStatus('Settings loaded.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!password) {
      setStatus('Enter the admin password to save settings.');
      return;
    }
    if (usdMode === 'manual' && !(Number(usdManual) > 0)) {
      setStatus('Enter a valid USD → XAF manual rate.');
      return;
    }
    if (xafMode === 'manual' && !(Number(xafManual) > 0)) {
      setStatus('Enter a valid XAF → USD manual rate.');
      return;
    }
    setLoading(true);
    setStatus('Saving...');
    try {
      const res = await fetch('/api/admin/rates/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({
          interval_minutes: Number(intervalMinutes),
          offset_xaf: Number(offsetXaf),
          usd_to_xaf_mode: usdMode,
          usd_to_xaf_manual: usdMode === 'manual' ? Number(usdManual) : undefined,
          xaf_to_usd_mode: xafMode,
          xaf_to_usd_manual: xafMode === 'manual' ? Number(xafManual) : undefined,
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
        setUsdMode(data.config.usd_to_xaf_mode ?? 'auto');
        setUsdManual(
          typeof data.config.usd_to_xaf_manual === 'number'
            ? String(data.config.usd_to_xaf_manual)
            : '',
        );
        setXafMode(data.config.xaf_to_usd_mode ?? 'auto');
        setXafManual(
          typeof data.config.xaf_to_usd_manual === 'number'
            ? String(data.config.xaf_to_usd_manual)
            : '',
        );
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
        <div>
          <label className="label">Admin password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="input"
          />
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
            <label className="label">USD → XAF rate</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setUsdMode('auto')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  usdMode === 'auto'
                    ? 'bg-midnight text-sand shadow-lg shadow-midnight/20'
                    : 'border border-midnight/20 bg-white text-midnight'
                }`}
              >
                Use local rate
              </button>
              <button
                type="button"
                onClick={() => setUsdMode('manual')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  usdMode === 'manual'
                    ? 'bg-midnight text-sand shadow-lg shadow-midnight/20'
                    : 'border border-midnight/20 bg-white text-midnight'
                }`}
              >
                Manual rate
              </button>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={usdManual}
              onChange={(e) => setUsdManual(e.target.value)}
              className="input mt-2"
              placeholder="Enter manual USD → XAF rate"
              disabled={usdMode !== 'manual'}
            />
            {currentUsdToXaf !== null && (
              <p className="mt-1 text-xs text-midnight/60">Current: {currentUsdToXaf} XAF</p>
            )}
          </div>

          <div>
            <label className="label">XAF → USD rate</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setXafMode('auto')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  xafMode === 'auto'
                    ? 'bg-midnight text-sand shadow-lg shadow-midnight/20'
                    : 'border border-midnight/20 bg-white text-midnight'
                }`}
              >
                Use local rate
              </button>
              <button
                type="button"
                onClick={() => setXafMode('manual')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  xafMode === 'manual'
                    ? 'bg-midnight text-sand shadow-lg shadow-midnight/20'
                    : 'border border-midnight/20 bg-white text-midnight'
                }`}
              >
                Manual rate
              </button>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={xafManual}
              onChange={(e) => setXafManual(e.target.value)}
              className="input mt-2"
              placeholder="Enter manual XAF → USD rate"
              disabled={xafMode !== 'manual'}
            />
            {currentXafToUsd !== null && (
              <p className="mt-1 text-xs text-midnight/60">Current: {currentXafToUsd} XAF</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={loadSettings} className="btn" disabled={loading}>
            Load settings
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
