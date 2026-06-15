export type AllgemeinerSchwerpunkt = 'Gebäudetechnik' | 'Energietechnik' | 'Maschinenbau' | 'Informatik' | 'Kaufmännisch';

export const SCHWERPUNKT_OPTIONS: AllgemeinerSchwerpunkt[] = [
  'Gebäudetechnik', 'Energietechnik', 'Maschinenbau', 'Informatik', 'Kaufmännisch'
];

export interface Firma {
  id?: string;
  name?: string;
  standort?: string;
  allgemeinerSchwerpunkt?: AllgemeinerSchwerpunkt;
  email?: string;
  telefon?: string;
  mobil?: string;
  angebotWebsite?: string;
}