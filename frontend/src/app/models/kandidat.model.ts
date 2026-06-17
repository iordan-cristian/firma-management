export { AllgemeinerSchwerpunkt, SCHWERPUNKT_OPTIONS } from './firma.model';
import { AllgemeinerSchwerpunkt } from './firma.model';

export type Geschlecht = 'männlich' | 'weiblich' | 'divers' | 'Bevorzuge nicht zu sagen';
export type Titel = 'Dr.' | 'Ing.';
export type Sprachniveau = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Muttersprache';
export type Fuehrerschein = 'vorhanden' | 'nicht vorhanden';

export const GESCHLECHT_OPTIONS: Geschlecht[] = ['männlich', 'weiblich', 'divers', 'Bevorzuge nicht zu sagen'];
export const TITEL_OPTIONS: Titel[] = ['Dr.', 'Ing.'];
export const SPRACHNIVEAU_OPTIONS: Sprachniveau[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Muttersprache'];
export const FUEHRERSCHEIN_OPTIONS: Fuehrerschein[] = ['vorhanden', 'nicht vorhanden'];

export interface Kandidat {
  id?: string;
  dsgvoBestaetigungsDatum?: string;
  geschlecht?: Geschlecht;
  titel?: Titel;
  vorname?: string;
  nachname?: string;
  postleitzahl?: number;
  ort?: string;
  geburtsjahr?: number;
  staatsangehoerigkeit?: string;
  familienstand?: string;
  kinder?: string;
  wochenstunden?: string;
  gehalt?: string;
  wochenendbereitschaft?: string;
  homeoffice?: string;
  firmenwagenregelung?: string;
  reisetaetigkeitenMitUebernachtung?: string;
  deutsch?: Sprachniveau;
  englisch?: Sprachniveau;
  sonstigeSprachen?: string;
  hochschulabschluss?: string;
  berufsausbildung?: string;
  autofuehrerschein?: Fuehrerschein;
  zertifikate?: string;
  taeglicheFahrzeit?: number;
  branchenkenntnisse?: string;
  aktuelleTaetigkeiten?: string;
  aktuellePosition?: string;
  wechselgruende?: string;
  zukuenftigePositionTaetigkeiten?: string;
  kuendigungsfrist?: string;
  erstesOnlineMeeting?: string;
  allgemeinerSchwerpunkt?: AllgemeinerSchwerpunkt;
  fachlicherSkill?: string;
  firmenSelbevorben?: string;
  firmenNogo?: string;
  email?: string;
  telefon?: string;
  linkedinProfil?: string;
  xingProfil?: string;
  gehaltMinimum?: number;
  gehaltMaximum?: number;
}

export type DokumentTyp = 'CV' | 'DSGVO' | 'INTERVIEW';
export const DOKUMENT_TYP_OPTIONS: { value: DokumentTyp; label: string }[] = [
  { value: 'CV', label: 'CV' },
  { value: 'DSGVO', label: 'DSGVO' },
  { value: 'INTERVIEW', label: 'Interview' },
];

export interface KandidatDokument {
  id: string;
  kandidatId: string;
  dokumentTyp: DokumentTyp;
  dateiname: string;
  mimeType: string;
  dateigroesse: number;
  hochgeladenAm: string;
}

export interface StagedDokument {
  file: File;
  dokumentTyp: DokumentTyp;
}