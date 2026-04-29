import type { AtlasClient } from '@/app/types/atlas-client';
import { ATLAS_STORAGE_KEYS } from '@/app/lib/atlas-storage-keys';

export function readClientsFromLocalStorage(): AtlasClient[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ATLAS_STORAGE_KEYS.clients);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AtlasClient[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeClientsToLocalStorage(clients: AtlasClient[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ATLAS_STORAGE_KEYS.clients, JSON.stringify(clients));
}

