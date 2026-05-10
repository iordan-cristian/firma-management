package com.firma.management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "ansprechpartner")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ansprechpartner {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "firma_id", columnDefinition = "uuid", nullable = false)
    private UUID firmaId;

    @Column(columnDefinition = "TEXT")
    private String vorname;

    @Column(columnDefinition = "TEXT")
    private String nachname;

    @Column(columnDefinition = "TEXT")
    private String schwerpunkt;

    @Column(columnDefinition = "TEXT")
    private String position;

    /**
     * Basic phone number validation: optional leading +, digits, spaces, dashes,
     * parentheses, and slashes are allowed. Must contain at least 5 digits overall.
     */
    @Pattern(
            regexp = "^$|^\\+?[0-9 ()/-]{5,}$",
            message = "telefonnummer must be a valid phone number"
    )
    @Column(columnDefinition = "TEXT")
    private String telefonnummer;

    @Email(message = "email must be a valid e-mail address")
    @Column(columnDefinition = "TEXT")
    private String email;

    @Column(columnDefinition = "TEXT")
    private String kontaktinterval;

    @Column(columnDefinition = "TEXT")
    private String informationen;

    @Column(name = "social_media_profil", columnDefinition = "TEXT")
    private String socialMediaProfil;
}
