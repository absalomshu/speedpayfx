'use client';

import { useEffect, useState } from 'react';

const FONT_SCALE_KEY = 'font-scale';
const FONT_SCALE_CLASS = 'font-scale-large';

export function FontSizeToggle() {
  const [isLarge, setIsLarge] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(FONT_SCALE_KEY) : null;
    setIsLarge(saved === 'large');
  }, []);

  useEffect(() => {
    if (isLarge === null) return;
    document.documentElement.classList.toggle(FONT_SCALE_CLASS, isLarge);
    localStorage.setItem(FONT_SCALE_KEY, isLarge ? 'large' : 'normal');
  }, [isLarge]);

  const largeEnabled = isLarge === true;

  return (
    <button
      type="button"
      onClick={() => setIsLarge((prev) => !prev)}
      aria-pressed={largeEnabled}
      aria-label={largeEnabled ? 'Use normal text size' : 'Use larger text size'}
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-midnight hover:bg-midnight/5"
      title={largeEnabled ? 'Normal text size' : 'Larger text size'}
    >
      <span className="flex items-baseline gap-0.5 font-black leading-none">
        <span className="text-[10px]">A</span>
        <span className="text-sm">A</span>
      </span>
    </button>
  );
}
