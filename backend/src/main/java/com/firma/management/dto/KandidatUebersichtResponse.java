package com.firma.management.dto;

import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Verknuepfung;
import com.firma.management.entity.VerknuepfungArchiviert;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/** One Kandidat with its current and archived Verknüpfungen, for the Kandidaten (Perm) Bestand. */
@Data
@AllArgsConstructor
public class KandidatUebersichtResponse {
    private Kandidat kandidat;
    private List<VerknuepfungInfo<Verknuepfung>> verknuepfungen;
    /** Links archived by "Reaktivieren" (verknuepfung_archiviert). */
    private List<VerknuepfungInfo<VerknuepfungArchiviert>> ehemaligeVerknuepfungen;

    @Data
    @AllArgsConstructor
    public static class VerknuepfungInfo<V> {
        private V verknuepfung;
        private String firmaName;
        private String sucheNach;
    }
}
