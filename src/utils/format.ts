/** Format a percentage value for display */
export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return '--';
  return `${Math.round(value)}%`;
}

/** Format a number with French locale */
export function formatNum(value: number | null | undefined): string {
  if (value === null || value === undefined) return '--';
  return value.toLocaleString('fr-FR');
}

/** Format salary */
export function formatSalary(value: number | null | undefined): string {
  if (value === null || value === undefined) return '--';
  return `${value.toLocaleString('fr-FR')} EUR`;
}

/** Truncate text to maxLen characters */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + '\u2026';
}

/** Option label mapping */
export const OPTION_LABELS: Record<string, string> = {
  sport: 'Section sportive',
  international: 'Section internationale',
  euro: 'Section europeenne',
  pro: 'Voie professionnelle',
  techno: 'Voie technologique',
  generale: 'Voie generale',
  postbac: 'Post-bac',
  segpa: 'SEGPA',
  ulis: 'ULIS',
  restauration: 'Restauration',
};
