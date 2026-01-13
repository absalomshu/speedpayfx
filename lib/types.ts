export type Rates = {
  usd_to_xaf: number;
  xaf_to_usd: number;
  updated_at: string;
};

export type RateMode = 'auto' | 'manual';

export type RateConfig = {
  interval_minutes: number;
  offset_xaf: number;
  last_checked_at: string | null;
  spread_xaf: number;
};

export type OrderDirection = 'WANT_USD' | 'WANT_XAF';
export type Currency = 'USD' | 'XAF';
export type OrderStatus = 'OPEN' | 'MATCHED';

export type Order = {
  id: string;
  created_at: string;
  status: OrderStatus;
  direction: OrderDirection;
  partner_has_amount: number;
  partner_has_currency: Currency;
  partner_wants_currency: Currency;
  desired_rate_xaf_per_usd: number | null;
  rate_display: string;
  you_will_pay_amount: number;
  you_will_pay_currency: Currency;
  you_will_receive_amount: number;
  you_will_receive_currency: Currency;
};
