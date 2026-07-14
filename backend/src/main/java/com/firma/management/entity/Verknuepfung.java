package com.firma.management.entity;

import jakarta.persistence.*;
import lombok.*;

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
}
