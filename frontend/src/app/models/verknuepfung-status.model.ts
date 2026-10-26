export type VerknuepfungStatus =
  | 'Selbstbeworben'
  | 'No-Go'
  | 'Vorgestellt'
  | 'Abgesagt'
  | 'Prozess Start'
  | 'Prozess laufend'
  | 'Prozess beiderseitige Zusage'
  | 'Prozess Rechnung vollständig bezahlt';

/** Numeric order per status (mirrors the backend VerknuepfungStatus enum codes). */
export const VERKNUEPFUNG_STATUS_ORDER: Record<VerknuepfungStatus, number> = {
  'Selbstbeworben': 1,
  'No-Go': 6,
  'Vorgestellt': 10,
  'Abgesagt': 20,
  'Prozess Start': 30,
  'Prozess laufend': 40,
  'Prozess beiderseitige Zusage': 50,
  'Prozess Rechnung vollständig bezahlt': 60,
};

/**
 * Highest status among the given ones; order 0 when none has a status.
 * Vorgestellt wins over Abgesagt, so a Kandidat that is still presented somewhere stays Vorgestellt.
 */
export function findHighestStatus(statuses: (string | undefined)[]): { highestStatus: number; highestStatusName?: VerknuepfungStatus } {
  let result: { highestStatus: number; highestStatusName?: VerknuepfungStatus } = { highestStatus: 0 };
  for (const status of statuses) {
    const name = status as VerknuepfungStatus;
    const order = VERKNUEPFUNG_STATUS_ORDER[name];
    if (order != null && order > result.highestStatus) result = { highestStatus: order, highestStatusName: name };
  }
  if (result.highestStatusName === 'Abgesagt' && statuses.includes('Vorgestellt')) {
    return { highestStatus: VERKNUEPFUNG_STATUS_ORDER['Vorgestellt'], highestStatusName: 'Vorgestellt' };
  }
  return result;
}

/** Finished = one Verknüpfung fully paid, or at least one Verknüpfung and all of them Abgesagt. */
export function isProzessBeendet(statuses: (string | undefined)[]): boolean {
  if (statuses.length === 0) return false;
  return statuses.includes('Prozess Rechnung vollständig bezahlt') || statuses.every(s => s === 'Abgesagt');
}

/** Statuses in ascending order (1 → 60). */
export const VERKNUEPFUNG_STATUS_OPTIONS: VerknuepfungStatus[] =
  (Object.keys(VERKNUEPFUNG_STATUS_ORDER) as VerknuepfungStatus[])
    .sort((a, b) => VERKNUEPFUNG_STATUS_ORDER[a] - VERKNUEPFUNG_STATUS_ORDER[b]);

/** Row colours per status (background + readable text colour). */
export const VERKNUEPFUNG_STATUS_COLORS: Record<VerknuepfungStatus, { background: string; color: string }> = {
  'Selbstbeworben': { background: '#ffff00', color: '#111' },
  'No-Go': { background: '#ffff00', color: '#111' },
  'Vorgestellt': { background: '#ffc000', color: '#111' },
  'Abgesagt': { background: '#ff4030', color: '#111' },
  'Prozess Start': { background: '#c1f0c8', color: '#111' },
  'Prozess laufend': { background: '#84e291', color: '#111' },
  'Prozess beiderseitige Zusage': { background: '#47d45a', color: '#111' },
  'Prozess Rechnung vollständig bezahlt': { background: '#1a4d24', color: '#fff' },
};
