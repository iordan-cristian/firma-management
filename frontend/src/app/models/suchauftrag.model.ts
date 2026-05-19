export type Aktivitaet = 'Investoren' | 'Vertrieb' | 'Imobilien' | 'Personal';
export type SuchauftragStatus = 'in Arbeit' | 'Fertig';

export const AKTIVITAET_OPTIONS: Aktivitaet[] = ['Investoren', 'Vertrieb', 'Imobilien', 'Personal'];
export const STATUS_OPTIONS: SuchauftragStatus[] = ['in Arbeit', 'Fertig'];

export interface Suchauftrag {
  id?: string;
  ansprechpartnerId: string;
  aktivitaet: Aktivitaet;
  auftragPlaceholder?: string;
  ort?: string;
  fachlicherSkill?: string;
  gehalt?: string;
  berufserfahrung?: string;
  branchenkenntnisse?: string;
  zertifikate?: string;
  status: SuchauftragStatus;
  anlageDatum?: string;
}