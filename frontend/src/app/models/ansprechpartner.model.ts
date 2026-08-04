import { Geschlecht, Titel } from './kandidat.model';

export interface Ansprechpartner {
  id?: string;
  firmaId: string;
  geschlecht?: Geschlecht;
  titel?: Titel;
  vorname?: string;
  nachname?: string;
  schwerpunkt?: string;
  position?: string;
  telefonnummer?: string;
  email?: string;
  kontaktinterval?: string;
  informationen?: string;
  linkedinProfil?: string;
  xingProfil?: string;
}
