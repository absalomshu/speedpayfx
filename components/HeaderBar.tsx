import Link from 'next/link';

export function HeaderBar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-white/85 backdrop-blur-md shadow-sm shadow-midnight/10">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-lg font-black tracking-tight text-midnight">
            FX Orders
          </Link>
        </div>
        <nav className="flex items-center gap-3 text-sm font-semibold text-midnight/80">
          <Link href="/create" className="rounded-full px-3 py-1 hover:bg-midnight/5">
            Create
          </Link>
          <Link href="/orders" className="rounded-full px-3 py-1 hover:bg-midnight/5">
            Orders
          </Link>
        </nav>
      </div>
    </header>
  );
}
