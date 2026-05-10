export type Aktivitaet = 'Investoren' | 'Vertrieb' | 'Imobilien' | 'Personal';
export type SuchauftragStatus = 'in Arbeit' | 'Fertig';

export const AKTIVITAET_OPTIONS: Aktivitaet[] = ['Investoren', 'Vertrieb', 'Imobilien', 'Personal'];
export const STATUS_OPTIONS: SuchauftragStatus[] = ['in Arbeit', 'Fertig'];

export interface Suchauftrag {
  id?: string;
  ansprechpartnerId: string;
  aktivitaet: Aktivitaet;
  auftragPlaceholder?: string;
  status: SuchauftragStatus;
}