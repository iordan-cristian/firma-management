export interface Verknuepfung {
  id?: string;
  suchauftragId?: string;
  firmaId?: string;
  kandidatId?: string;
  gebuehren?: number;
  mainAnteil?: number;
  verknuepfungStatus?: string;
  verknuepfungStatusKommentar?: string;
  /** Read-only, "dd/MM/yyyy"; set by the backend whenever the status changes. */
  statusGeaendertAm?: string;
}

/** Verknüpfung moved to the archive by "Reaktivieren"; archiviertAm is "dd/MM/yyyy". */
export interface VerknuepfungArchiviert extends Verknuepfung {
  archiviertAm?: string;
}

export interface VerknuepfungKandidat {
  kandidatId: string;
  vorname?: string;
  nachname?: string;
  position?: string;
}
