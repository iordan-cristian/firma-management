package com.firma.management.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
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

    @Column(name = "verknuepfung_status", columnDefinition = "TEXT")
    private String verknuepfungStatus;
}
