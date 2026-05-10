package com.firma.management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
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
    private String name;

    @Column(columnDefinition = "TEXT")
    private String standort;

    @Column(name = "allgemeiner_schwerpunkt", columnDefinition = "TEXT")
    private String allgemeinerSchwerpunkt;

    @Email(message = "email must be a valid e-mail address")
    @Column(columnDefinition = "TEXT")
    private String email;

    @Pattern(regexp = "^$|^\\+?[0-9 ()/-]{5,}$", message = "telefon must be a valid phone number")
    @Column(columnDefinition = "TEXT")
    private String telefon;

    @Pattern(regexp = "^$|^\\+?[0-9 ()/-]{5,}$", message = "mobil must be a valid phone number")
    @Column(columnDefinition = "TEXT")
    private String mobil;
}
