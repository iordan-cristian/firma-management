package com.firma.management.dto;

import com.firma.management.entity.Geschlecht;
import com.firma.management.entity.Suchauftrag;
import com.firma.management.entity.Titel;
import com.firma.management.entity.Verknuepfung;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class SuchauftragUebersichtResponse {
    private Suchauftrag suchauftrag;
    private String firmaName;
    private Geschlecht ansprechpartnerGeschlecht;
    private Titel ansprechpartnerTitel;
    private String ansprechpartnerVorname;
    private String ansprechpartnerNachname;
    private List<KandidatLink> kandidaten;

    @Data
    @AllArgsConstructor
    public static class KandidatLink {
        private UUID kandidatId;
        private Geschlecht geschlecht;
        private Titel titel;
        private String vorname;
        private String nachname;
        private Verknuepfung verknuepfung;
    }
}
