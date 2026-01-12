import { readRates } from '../../../../../lib/orders';
import { readNalaRates, readRateConfig, writeRateConfig } from '../../../../../lib/rate-updater';
import type { RateConfig, RateMode } from '../../../../../lib/types';

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
  if (body.usd_to_xaf_mode !== undefined) {
    if (body.usd_to_xaf_mode !== 'auto' && body.usd_to_xaf_mode !== 'manual') {
      return Response.json({ error: 'USD to XAF mode must be auto or manual' }, { status: 400 });
    }
    update.usd_to_xaf_mode = body.usd_to_xaf_mode as RateMode;
  }
  if (body.xaf_to_usd_mode !== undefined) {
    if (body.xaf_to_usd_mode !== 'auto' && body.xaf_to_usd_mode !== 'manual') {
      return Response.json({ error: 'XAF to USD mode must be auto or manual' }, { status: 400 });
    }
    update.xaf_to_usd_mode = body.xaf_to_usd_mode as RateMode;
  }
  if (body.usd_to_xaf_manual !== undefined) {
    const manual = Number(body.usd_to_xaf_manual);
    if (!Number.isFinite(manual) || manual <= 0) {
      return Response.json({ error: 'USD to XAF manual rate must be greater than zero' }, { status: 400 });
    }
    update.usd_to_xaf_manual = manual;
  }
  if (body.xaf_to_usd_manual !== undefined) {
    const manual = Number(body.xaf_to_usd_manual);
    if (!Number.isFinite(manual) || manual <= 0) {
      return Response.json({ error: 'XAF to USD manual rate must be greater than zero' }, { status: 400 });
    }
    update.xaf_to_usd_manual = manual;
  }

  if (update.usd_to_xaf_mode === 'manual' || update.xaf_to_usd_mode === 'manual') {
    const current = await readRateConfig();
    const usdManual =
      typeof update.usd_to_xaf_manual === 'number'
        ? update.usd_to_xaf_manual
        : current.usd_to_xaf_manual;
    const xafManual =
      typeof update.xaf_to_usd_manual === 'number'
        ? update.xaf_to_usd_manual
        : current.xaf_to_usd_manual;

    if (update.usd_to_xaf_mode === 'manual' && typeof usdManual !== 'number') {
      return Response.json(
        { error: 'USD to XAF manual rate is required in manual mode' },
        { status: 400 },
      );
    }
    if (update.xaf_to_usd_mode === 'manual' && typeof xafManual !== 'number') {
      return Response.json(
        { error: 'XAF to USD manual rate is required in manual mode' },
        { status: 400 },
      );
    }
  }

  const config = await writeRateConfig(update);
  return Response.json({ config });
}
