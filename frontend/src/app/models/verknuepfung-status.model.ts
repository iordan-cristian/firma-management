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

/** Statuses in ascending order (1 → 60). */
export const VERKNUEPFUNG_STATUS_OPTIONS: VerknuepfungStatus[] =
  (Object.keys(VERKNUEPFUNG_STATUS_ORDER) as VerknuepfungStatus[])
    .sort((a, b) => VERKNUEPFUNG_STATUS_ORDER[a] - VERKNUEPFUNG_STATUS_ORDER[b]);
