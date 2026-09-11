export interface Verknuepfung {
  id?: string;
  suchauftragId?: string;
  firmaId?: string;
  kandidatId?: string;
  gebuehren?: number;
  mainAnteil?: number;
  verknuepfungStatus?: string;
  verknuepfungStatusKommentar?: string;
}

export interface VerknuepfungKandidat {
  kandidatId: string;
  vorname?: string;
  nachname?: string;
  position?: string;
}
