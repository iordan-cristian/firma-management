package com.firma.management.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "kandidat_dokument")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KandidatDokument {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "kandidat_id", columnDefinition = "uuid", nullable = false)
    private UUID kandidatId;

    @Enumerated(EnumType.STRING)
    @Column(name = "dokument_typ")
    private DokumentTyp dokumentTyp;

    @Column(nullable = false)
    private String dateiname;

    @Column(nullable = false)
    private String objektKey;

    @Column(nullable = false)
    private String mimeType;

    @Column(nullable = false)
    private Long dateigroesse;

    @Column(nullable = false)
    private OffsetDateTime hochgeladenAm;
}
