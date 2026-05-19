package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "suchauftrag")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Suchauftrag {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "ansprechpartner_id", columnDefinition = "uuid", nullable = false)
    private UUID ansprechpartnerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "aktivitaet", nullable = false)
    private Aktivitaet aktivitaet;

    @Column(name = "auftrag_placeholder", columnDefinition = "TEXT")
    private String auftragPlaceholder;

    @Column(columnDefinition = "TEXT")
    private String ort;

    @Column(name = "fachlicher_skill", columnDefinition = "TEXT")
    private String fachlicherSkill;

    @Column(columnDefinition = "TEXT")
    private String gehalt;

    @Column(columnDefinition = "TEXT")
    private String berufserfahrung;

    @Column(columnDefinition = "TEXT")
    private String branchenkenntnisse;

    @Column(columnDefinition = "TEXT")
    private String zertifikate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @Column(name = "anlage_datum")
    private LocalDate anlageDatum;
}
