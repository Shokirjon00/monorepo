export type PeriodKind = 'today' | 'week' | 'month' | 'quarter' | 'year';

export const periodKindFromName = (name: string): PeriodKind | undefined => {
  const n = (name ?? '').toLowerCase();
  if (n.includes('сегодн') || n.includes('вчера') || n.includes('час')) return 'today';
  if (n.includes('недел')) return 'week';
  if (n.includes('месяц')) return 'month';
  if (n.includes('квартал')) return 'quarter';
  if (n.includes('год')) return 'year';
  return undefined;
};

export const buildPeriodKindMap = (items: { id: string; name: string }[]): Record<string, PeriodKind> => {
  const map: Record<string, PeriodKind> = {};
  for (const item of items ?? []) {
    const kind = periodKindFromName(item.name);
    if (kind) map[item.id] = kind;
  }
  return map;
};
