package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "verknuepfung")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Verknuepfung {

    @Id
    @GeneratedValue
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

    /** Set by VerknuepfungService whenever verknuepfungStatus changes. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(name = "status_geaendert_am")
    private LocalDate statusGeaendertAm;
}
