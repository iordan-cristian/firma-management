package com.firma.management.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "firma")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Firma {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(columnDefinition = "TEXT")
    private String kontaktdaten;

    @Column(columnDefinition = "TEXT")
    private String standort;

    @Column(name = "allgemeiner_schwerpunkt", columnDefinition = "TEXT")
    private String allgemeinerSchwerpunkt;
}
