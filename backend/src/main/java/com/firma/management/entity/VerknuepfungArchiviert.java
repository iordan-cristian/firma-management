package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/** Verknüpfung moved out of verknuepfung by "Reaktivieren"; keeps the original id. */
@Entity
@Table(name = "verknuepfung_archiviert")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerknuepfungArchiviert {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "suchauftrag_id", columnDefinition = "uuid")
    private UUID suchauftragId;

    @Column(name = "firma_id", columnDefinition = "uuid")
    private UUID firmaId;

    @Column(name = "kandidat_id", columnDefinition = "uuid")
    private UUID kandidatId;

    @Column(name = "gebuehren", precision = 10, scale = 2)
    private BigDecimal gebuehren;

    @Column(name = "main_anteil", precision = 10, scale = 2)
    private BigDecimal mainAnteil;

    @Enumerated(EnumType.STRING)
    @Column(name = "verknuepfung_status")
    private VerknuepfungStatus verknuepfungStatus;

    @Column(name = "verknuepfung_status_kommentar", columnDefinition = "TEXT")
    private String verknuepfungStatusKommentar;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @Column(name = "archiviert_am", nullable = false)
    private LocalDate archiviertAm;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @Column(name = "status_geaendert_am")
    private LocalDate statusGeaendertAm;

    public static VerknuepfungArchiviert of(Verknuepfung v, LocalDate archiviertAm) {
        return VerknuepfungArchiviert.builder()
                .id(v.getId())
                .suchauftragId(v.getSuchauftragId())
                .firmaId(v.getFirmaId())
                .kandidatId(v.getKandidatId())
                .gebuehren(v.getGebuehren())
                .mainAnteil(v.getMainAnteil())
                .verknuepfungStatus(v.getVerknuepfungStatus())
                .verknuepfungStatusKommentar(v.getVerknuepfungStatusKommentar())
                .archiviertAm(archiviertAm)
                .statusGeaendertAm(v.getStatusGeaendertAm())
                .build();
    }
}
