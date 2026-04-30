package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "vertrag")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vertrag {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "ansprechpartner_id", columnDefinition = "uuid", nullable = false)
    private UUID ansprechpartnerId;

    @Column(name = "firma_id", columnDefinition = "uuid", nullable = false)
    private UUID firmaId;

    @Column(name = "suchauftrag_id", columnDefinition = "uuid")
    private UUID suchauftragId;

    @Column(name = "wert", precision = 19, scale = 2)
    private BigDecimal wert;

    /** Stored as DATE; serialized as dd/MM/yyyy. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @Column(name = "bezahlbar_am")
    private LocalDate bezahlbarAm;

    @Column(name = "bezahlt", nullable = false)
    private Boolean bezahlt;
}
