package com.firma.management.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** German PLZ with coordinates (GeoNames, CC BY 4.0), filled by migration V37. Read-only. */
@Entity
@Table(name = "plz_koordinate")
@Getter
@NoArgsConstructor
public class PlzKoordinate {

    @Id
    @Column(length = 5)
    private String plz;

    private Double lat;

    private Double lon;
}
