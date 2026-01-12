import Link from 'next/link';

type CurrencyCode = 'USD' | 'XAF';

type Option = {
  currencyCode: CurrencyCode;
  currencyLabel: string;
  description: string;
  href: string;
};

const options: Option[] = [
  {
    currencyCode: 'XAF',
    currencyLabel: 'franc CFA',
    description: 'I will pay USD, receive XAF',
    href: '/create/want-xaf',
  },
  {
    currencyCode: 'USD',
    currencyLabel: 'USD',
    description: 'I will pay XAF, receive USD',
    href: '/create/want-usd',
  },
];

type FlagIconProps = {
  code: CurrencyCode;
};

function FlagIcon({ code }: FlagIconProps) {
  const isUsd = code === 'USD';
  return (
    <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-sm bg-white">
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

export const runtime = 'edge';

export default function CreatePage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-midnight/60">Create Order</p>
        <h1 className="text-2xl font-black text-midnight">Choose what you need</h1>
      </header>
      <div className="grid grid-cols-1 gap-3">
        {options.map((opt) => (
          <Link key={opt.href} href={opt.href} className="card flex flex-col gap-2 p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
            <span className="text-lg font-bold text-midnight">
              I want{' '}
              <span className="inline-flex items-center gap-2">
                <FlagIcon code={opt.currencyCode} />
                <span>{opt.currencyLabel}</span>
              </span>
            </span>
            <span className="text-sm text-midnight/70">{opt.description}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
