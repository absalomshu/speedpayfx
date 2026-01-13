import { getRequestContext } from '@cloudflare/next-on-pages';
import { readRates, writeRates } from './orders';
import { getStorage } from './storage';
import type { RateConfig, Rates } from './types';

const RATE_CONFIG_KEY = 'rates:config';

const DEFAULT_RATE_CONFIG: RateConfig = {
  interval_minutes: 120,
  offset_xaf: 2,
  last_checked_at: null,
  spread_xaf: 15,
};

type NalaRates = {
  usd_to_xaf: number;
  xaf_to_usd: number;
  has_direct_xaf_to_usd: boolean;
};

const DEFAULT_NALA_RATES_URL = 'https://partners-api.prod.nala-api.com/v1/fx/rates';

type NalaRateRow = {
  source_currency: string;
  destination_currency: string;
  rate: number;
  provider_name: string;
  created_at: string;
};

const normalizeRateConfig = (value?: Partial<RateConfig> | null): RateConfig => {
  const intervalMinutes = Number.isFinite(value?.interval_minutes)
    ? Math.max(5, Math.round(value?.interval_minutes ?? DEFAULT_RATE_CONFIG.interval_minutes))
    : DEFAULT_RATE_CONFIG.interval_minutes;
  const offsetXaf = Number.isFinite(value?.offset_xaf)
    ? Math.max(0, Math.round(value?.offset_xaf ?? DEFAULT_RATE_CONFIG.offset_xaf))
    : DEFAULT_RATE_CONFIG.offset_xaf;
  const lastCheckedAt = typeof value?.last_checked_at === 'string' ? value.last_checked_at : null;
  const spreadXaf = Number.isFinite(value?.spread_xaf)
    ? Math.max(0, Math.round(value?.spread_xaf ?? DEFAULT_RATE_CONFIG.spread_xaf))
    : DEFAULT_RATE_CONFIG.spread_xaf;
  return {
    interval_minutes: intervalMinutes,
    offset_xaf: offsetXaf,
    last_checked_at: lastCheckedAt,
    spread_xaf: spreadXaf,
  };
};

export async function readRateConfig(): Promise<RateConfig> {
  const kv = await getStorage();
  const raw = await kv.get(RATE_CONFIG_KEY);
  if (!raw) {
    const seeded = { ...DEFAULT_RATE_CONFIG };
    await kv.put(RATE_CONFIG_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<RateConfig>;
    return normalizeRateConfig(parsed);
  } catch {
    return { ...DEFAULT_RATE_CONFIG };
  }
}

export async function writeRateConfig(update: Partial<RateConfig>): Promise<RateConfig> {
  const current = await readRateConfig();
  const next = normalizeRateConfig({ ...current, ...update });
  const kv = await getStorage();
  await kv.put(RATE_CONFIG_KEY, JSON.stringify(next));
  return next;
}

async function fetchNalaRates(): Promise<NalaRates> {
  const { env } = getRequestContext();
  const envVars = env as Record<string, string | undefined>;
  const url = envVars.NALA_RATES_URL ?? DEFAULT_NALA_RATES_URL;

  const headers: HeadersInit = { Accept: 'application/json' };
  const apiKey = envVars.NALA_API_KEY;
  const apiKeyHeader = envVars.NALA_API_KEY_HEADER ?? 'Authorization';
  const apiKeyPrefix = envVars.NALA_API_KEY_PREFIX ?? 'Bearer ';
  if (apiKey) {
    headers[apiKeyHeader] = apiKeyPrefix ? `${apiKeyPrefix}${apiKey}` : apiKey;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Nala rates request failed (${res.status})`);
  }
  const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  const rawData = payload?.data;
  if (!Array.isArray(rawData)) {
    throw new Error('Nala rates response missing data array');
  }

  const rows: NalaRateRow[] = rawData
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => {
      const source = String(item.source_currency ?? '').toUpperCase();
      const destination = String(item.destination_currency ?? '').toUpperCase();
      const provider = String(item.provider_name ?? '').toLowerCase();
      return {
        source_currency: source,
        destination_currency: destination,
        rate: Number(item.rate),
        provider_name: provider,
        created_at: String(item.created_at ?? ''),
      };
    })
    .filter((item) => item.provider_name === 'nala' && Number.isFinite(item.rate));

  const pickLatestRate = (source: string, destination: string) => {
    const matches = rows.filter(
      (row) => row.source_currency === source && row.destination_currency === destination,
    );
    if (!matches.length) return null;
    return matches.reduce((latest, current) => {
      const latestTime = Date.parse(latest.created_at) || 0;
      const currentTime = Date.parse(current.created_at) || 0;
      return currentTime > latestTime ? current : latest;
    }).rate;
  };

  const usdToXaf = pickLatestRate('USD', 'XAF');
  if (!Number.isFinite(usdToXaf ?? NaN)) {
    throw new Error('Nala rates response missing NALA USD->XAF rate');
  }
  const directXafToUsd = pickLatestRate('XAF', 'USD');
  const xafToUsd = directXafToUsd ?? usdToXaf;

  return {
    usd_to_xaf: Number(usdToXaf),
    xaf_to_usd: Number(xafToUsd),
    has_direct_xaf_to_usd: Number.isFinite(directXafToUsd ?? NaN),
  };
}

export async function readNalaRates() {
  return fetchNalaRates();
}

export async function maybeRefreshRates(options?: { force?: boolean }) {
  const config = await readRateConfig();
  const rates = await readRates();
  const force = options?.force === true;

  const lastCheckedAt = config.last_checked_at ? new Date(config.last_checked_at) : new Date(0);
  const now = new Date();
  const due =
    force || now.getTime() - lastCheckedAt.getTime() >= config.interval_minutes * 60 * 1000;

  let nalaRates: NalaRates | null = null;
  if (due) {
    nalaRates = await fetchNalaRates();
  }
  const offset = config.offset_xaf;

  let nextUsdToXaf = rates.usd_to_xaf;
  if (nalaRates) {
    nextUsdToXaf =
      Math.abs(nalaRates.usd_to_xaf - rates.usd_to_xaf) >= offset
        ? nalaRates.usd_to_xaf
        : rates.usd_to_xaf;
  }

  const nextXafToUsd = nextUsdToXaf + config.spread_xaf;

  let updatedRates: Rates = rates;
  if (nextUsdToXaf !== rates.usd_to_xaf || nextXafToUsd !== rates.xaf_to_usd) {
    updatedRates = await writeRates({
      usd_to_xaf: nextUsdToXaf,
      xaf_to_usd: nextXafToUsd,
      updated_at: new Date().toISOString(),
    });
  }

  const nextConfig = due
    ? await writeRateConfig({ last_checked_at: now.toISOString() })
    : config;
  return { rates: updatedRates, updated: updatedRates !== rates, config: nextConfig };
}
