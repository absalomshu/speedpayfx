import Link from 'next/link';

export function HeaderBar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-white/85 backdrop-blur-md shadow-sm shadow-midnight/10">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-lg font-black tracking-tight text-midnight">
            SpeedpayFX
          </Link>
        </div>
        <nav className="flex items-center gap-2 text-sm font-semibold text-midnight/80">
          <Link href="/create" className="inline-flex items-center gap-2 rounded-full px-3 py-1 hover:bg-midnight/5">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 text-midnight/70">
              <path
                fill="currentColor"
                d="M10 4.5a.75.75 0 0 1 .75.75v3.75h3.75a.75.75 0 0 1 0 1.5h-3.75v3.75a.75.75 0 0 1-1.5 0v-3.75H5.5a.75.75 0 0 1 0-1.5h3.75V5.25A.75.75 0 0 1 10 4.5Z"
              />
            </svg>
            Create
          </Link>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-full border border-midnight/10 bg-midnight/5 px-3 py-1 text-midnight shadow-sm shadow-midnight/5 transition hover:-translate-y-0.5 hover:bg-midnight/10"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 text-midnight/70">
              <path
                fill="currentColor"
                d="M5.25 5.75A.75.75 0 0 1 6 5h8a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Zm0 4A.75.75 0 0 1 6 9h8a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Zm0 4A.75.75 0 0 1 6 13h5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Z"
              />
            </svg>
            Orders
          </Link>
        </nav>
      </div>
    </header>
  );
}
