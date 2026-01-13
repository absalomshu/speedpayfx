import { readRates } from '../../../../../lib/orders';
import { readNalaRates, readRateConfig, writeRateConfig } from '../../../../../lib/rate-updater';
import type { RateConfig } from '../../../../../lib/types';

export const runtime = 'edge';

export async function GET(req: Request) {
  const [config, rates] = await Promise.all([readRateConfig(), readRates()]);
  let nalaRates = null;
  let nalaError: string | null = null;
  try {
    nalaRates = await readNalaRates();
  } catch (err) {
    nalaError = err instanceof Error ? err.message : 'Failed to load Nala rates';
  }
  return Response.json({ config, rates, nala_rates: nalaRates, nala_error: nalaError });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<RateConfig> | null;
  if (!body) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const update: Partial<RateConfig> = {};
  if (body.interval_minutes !== undefined) {
    const interval = Number(body.interval_minutes);
    if (!Number.isFinite(interval) || interval <= 0) {
      return Response.json({ error: 'Interval must be a positive number' }, { status: 400 });
    }
    update.interval_minutes = interval;
  }
  if (body.offset_xaf !== undefined) {
    const offset = Number(body.offset_xaf);
    if (!Number.isFinite(offset) || offset < 0) {
      return Response.json({ error: 'Offset must be zero or greater' }, { status: 400 });
    }
    update.offset_xaf = offset;
  }
  if (body.spread_xaf !== undefined) {
    const spread = Number(body.spread_xaf);
    if (!Number.isFinite(spread) || spread < 0) {
      return Response.json({ error: 'Spread must be zero or greater' }, { status: 400 });
    }
    update.spread_xaf = spread;
  }

  const config = await writeRateConfig(update);
  return Response.json({ config });
}
