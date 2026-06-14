export type Aktivitaet = 'Investoren' | 'Vertrieb' | 'Imobilien' | 'Personal';
export type SuchauftragStatus = 'in Arbeit' | 'Fertig';

export const AKTIVITAET_OPTIONS: Aktivitaet[] = ['Investoren', 'Vertrieb', 'Imobilien', 'Personal'];
export const STATUS_OPTIONS: SuchauftragStatus[] = ['in Arbeit', 'Fertig'];

export interface Suchauftrag {
  id?: string;
  ansprechpartnerId: string;
  aktivitaet: Aktivitaet;
  ort?: string;
  postleitzahl?: string;
  adresse?: string;
  fachlicherSkill?: string;
  gehalt?: string;
  gehaltMehrInfo?: string;
  berufserfahrung?: string;
  branchenkenntnisse?: string;
  zertifikate?: string;
  deutsch?: string;
  englisch?: string;
  sonstigeSprachen?: string;
  informationen?: string;
  status: SuchauftragStatus;
  anlageDatum?: string;
}