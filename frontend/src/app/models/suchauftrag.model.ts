import { Geschlecht, Sprachniveau, Titel } from './kandidat.model';
import { AllgemeinerSchwerpunkt } from './allgemeiner-schwerpunkt.model';
import { Verknuepfung, VerknuepfungArchiviert } from './verknuepfung.model';
export { Sprachniveau };

export type Aktivitaet = 'Investoren' | 'Vertrieb' | 'Imobilien' | 'Personal';
export type SuchauftragStatus = 'in Arbeit' | 'Fertig';

export const AKTIVITAET_OPTIONS: Aktivitaet[] = ['Investoren', 'Vertrieb', 'Imobilien', 'Personal'];
export const STATUS_OPTIONS: SuchauftragStatus[] = ['in Arbeit', 'Fertig'];

export interface Suchauftrag {
  id?: string;
  ansprechpartnerId: string;
  aktivitaet: Aktivitaet;
  sucheNach?: string;
  ort?: string;
  postleitzahl?: string;
  adresse?: string;
  /** In km. */
  entfernung?: number;
  allgemeinerSchwerpunkt?: AllgemeinerSchwerpunkt;
  allgemeinerSchwerpunktKOKriterium?: boolean;
  fachlicherSkill?: string;
  fachlicherSkillKOKriterium?: boolean;
  fachlicherSkillMindestensEin?: boolean;
  optionalFachlicheSkills?: string;
  gehalt?: string;
  gehaltKOKriterium?: boolean;
  gehaltMehrInfo?: string;
  berufserfahrung?: number;
  berufserfahrungKOKriterium?: boolean;
  branchenkenntnisse?: string;
  branchenkenntnisseKOKriterium?: boolean;
  branchenkenntnisseMindestensEin?: boolean;
  optionalBranchenkenntnisse?: string;
  zertifikate?: string;
  zertifikateKOKriterium?: boolean;
  zertifikateMindestensEin?: boolean;
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

export interface SuchauftragUebersichtKandidat<V extends Verknuepfung = Verknuepfung> {
  kandidatId: string;
  geschlecht?: Geschlecht;
  titel?: Titel;
  vorname?: string;
  nachname?: string;
  verknuepfung: V;
}

export interface SuchauftragUebersicht {
  suchauftrag: Suchauftrag;
  firmaId?: string;
  firmaName?: string;
  ansprechpartnerGeschlecht?: Geschlecht;
  ansprechpartnerTitel?: Titel;
  ansprechpartnerVorname?: string;
  ansprechpartnerNachname?: string;
  kandidaten: SuchauftragUebersichtKandidat[];
  /** Links archived by "Reaktivieren". */
  ehemaligeKandidaten: SuchauftragUebersichtKandidat<VerknuepfungArchiviert>[];
}
