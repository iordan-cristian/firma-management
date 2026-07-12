import { Sprachniveau } from './kandidat.model';
export { Sprachniveau };

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
  fachlicherSkillKOKriterium?: boolean;
  optionalFachlicheSkills?: string;
  gehalt?: string;
  gehaltKOKriterium?: boolean;
  gehaltMehrInfo?: string;
  berufserfahrung?: string;
  branchenkenntnisse?: string;
  zertifikate?: string;
  zertifikateKOKriterium?: boolean;
  optionalZertifikate?: string;
  deutsch?: Sprachniveau;
  deutschKOKriterium?: boolean;
  englisch?: Sprachniveau;
  englischKOKriterium?: boolean;
  sonstigeSprachen?: string;
  sonstigeSprachenKOKriterium?: boolean;
  informationen?: string;
  status: SuchauftragStatus;
  anlageDatum?: string;
  gehaltMinimum?: number;
  gehaltMaximum?: number;
}