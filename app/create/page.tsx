import Link from 'next/link';

const options = [
  {
    label: 'I want USD',
    description: 'I will pay XAF, receive USD',
    href: '/create/want-usd',
  },
  {
    label: 'I want XAF',
    description: 'I will pay USD, receive XAF',
    href: '/create/want-xaf',
  },
];

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
            <span className="text-lg font-bold text-midnight">{opt.label}</span>
            <span className="text-sm text-midnight/70">{opt.description}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
