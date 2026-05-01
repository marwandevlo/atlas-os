'use client';

import { Search } from 'lucide-react';

export function GlobalSearchButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('atlas:open-search'))}
      className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm text-sm text-gray-600 hover:bg-gray-50"
      aria-label="Ouvrir la recherche"
    >
      <Search size={16} className="text-gray-500" />
      <span>Rechercher</span>
      <span className="ml-1 text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">Ctrl K</span>
    </button>
  );
}

