export type AllgemeinerSchwerpunkt = 'Technik' | 'Informatik' | 'Kaufmännisch';

export const SCHWERPUNKT_OPTIONS: AllgemeinerSchwerpunkt[] = [
  'Technik', 'Informatik', 'Kaufmännisch'
];

export interface Firma {
  id?: string;
  name?: string;
  standort?: string;
  email?: string;
  telefon?: string;
  mobil?: string;
  angebotWebsite?: string;
}