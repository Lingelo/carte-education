import type { EtablissementType } from '../types';

export const TYPE_COLORS: Record<EtablissementType, string> = {
  Ecole: '#38bdf8',
  College: '#6366f1',
  Lycee: '#8b5cf6',
};

export const TYPE_LABELS: Record<EtablissementType, string> = {
  Ecole: 'Ecole',
  College: 'College',
  Lycee: 'Lycee',
};

export const ALL_TYPES: EtablissementType[] = ['Ecole', 'College', 'Lycee'];

export const UNIVERSITE_COLOR = '#f59e0b';

/** Color for insertion rate: green for high, red for low */
export function insertionColor(taux: number | null): string {
  if (taux === null) return '#6b7280';
  if (taux >= 90) return '#16a34a';
  if (taux >= 80) return '#65a30d';
  if (taux >= 70) return '#f59e0b';
  if (taux >= 60) return '#f97316';
  return '#dc2626';
}
