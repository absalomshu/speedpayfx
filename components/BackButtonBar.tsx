"use client";

import { usePathname, useRouter } from 'next/navigation';

export function BackButtonBar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome) return null;

  return (
    <div>
      <div className="mx-auto flex max-w-xl px-4 pb-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full bg-midnight/5 px-3 py-1 text-sm font-semibold text-midnight transition hover:bg-midnight/10"
          aria-label="Go back"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
