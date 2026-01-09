import { v4 as uuid } from 'uuid';
import { getStorage } from './storage';
import type { Order, Rates } from './types';

export const DEFAULT_RATES: Rates = {
  usd_to_xaf: 570,
  xaf_to_usd: 600,
  updated_at: '',
};

const RATES_KEY = 'rates';
const ORDERS_INDEX_KEY = 'orders:index';

export async function readRates(): Promise<Rates> {
  const kv = await getStorage();
  const raw = await kv.get(RATES_KEY);
  if (!raw) {
    const defaults: Rates = { ...DEFAULT_RATES, updated_at: new Date().toISOString() };
    await kv.put(RATES_KEY, JSON.stringify(defaults));
    return defaults;
  }
  const parsed = JSON.parse(raw) as Rates;
  return parsed;
}

export async function writeRates(rates: Rates) {
  const kv = await getStorage();
  const payload = { ...rates, updated_at: new Date().toISOString() } satisfies Rates;
  await kv.put(RATES_KEY, JSON.stringify(payload));
  return payload;
}

async function getOrderIndex(): Promise<string[]> {
  const kv = await getStorage();
  const raw = await kv.get(ORDERS_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

async function saveOrderIndex(ids: string[]) {
  const kv = await getStorage();
  await kv.put(ORDERS_INDEX_KEY, JSON.stringify(ids));
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'status'>) {
  const kv = await getStorage();
  const id = uuid();
  const created_at = new Date().toISOString();
  const record: Order = { ...order, id, created_at, status: 'OPEN' };
  await kv.put(`order:${id}`, JSON.stringify(record));
  const index = await getOrderIndex();
  index.unshift(id);
  await saveOrderIndex(index);
  return record;
}

export async function fetchOrder(id: string): Promise<Order | null> {
  const kv = await getStorage();
  const raw = await kv.get(`order:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}

export async function listOpenOrders(): Promise<Order[]> {
  const kv = await getStorage();
  const index = await getOrderIndex();
  const results: Order[] = [];
  for (const id of index) {
    const order = await fetchOrder(id);
    if (order && order.status === 'OPEN') {
      results.push(order);
    }
  }
  return results;
}

export async function matchOrder(id: string): Promise<Order | null> {
  const kv = await getStorage();
  const order = await fetchOrder(id);
  if (!order) return null;
  const updated: Order = { ...order, status: 'MATCHED' };
  await kv.put(`order:${id}`, JSON.stringify(updated));
  return updated;
}

export async function exportAll() {
  const kv = await getStorage();
  const rates = await readRates();
  const index = await getOrderIndex();
  const orders: Record<string, Order> = {};
  for (const id of index) {
    const order = await fetchOrder(id);
    if (order) orders[id] = order;
  }
  return {
    rates,
    orders_index: index,
    orders,
  };
}

export async function importAll(payload: {
  rates: Rates;
  orders_index: string[];
  orders: Record<string, Order>;
}) {
  const kv = await getStorage();
  await kv.put(RATES_KEY, JSON.stringify(payload.rates));
  await kv.put(ORDERS_INDEX_KEY, JSON.stringify(payload.orders_index));
  for (const [id, order] of Object.entries(payload.orders)) {
    await kv.put(`order:${id}`, JSON.stringify(order));
  }
}
