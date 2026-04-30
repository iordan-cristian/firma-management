export interface Vertrag {
  id?: string;
  ansprechpartnerId: string;
  firmaId: string;
  suchauftragId?: string;
  wert?: number;
  /** Format: dd/MM/yyyy */
  bezahlbarAm?: string;
  bezahlt: boolean;
}
