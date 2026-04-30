package com.firma.management.entity;

import jakarta.persistence.*;
import lombok.*;

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
    @Column(name = "kernbereich", nullable = false)
    private Kernbereich kernbereich;

    @Column(name = "auftrag_placeholder", columnDefinition = "TEXT")
    private String auftragPlaceholder;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;
}
