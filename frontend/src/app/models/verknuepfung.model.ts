export interface Verknuepfung {
  id?: string;
  suchauftragId?: string;
  firmaId?: string;
  kandidatId?: string;
}

export interface VerknuepfungKandidat {
  kandidatId: string;
  vorname?: string;
  nachname?: string;
  position?: string;
}

export interface VerknuepfungOverview {
  id: string;
  firmaId?: string;
  firmaName?: string;
  suchauftragId?: string;
  suchauftragAktivitaet?: string;
  kandidatId?: string;
  kandidatVorname?: string;
  kandidatNachname?: string;
}
