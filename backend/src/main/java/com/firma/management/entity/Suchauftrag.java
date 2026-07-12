package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
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

    @Column(columnDefinition = "TEXT")
    private String ort;

    @Column(columnDefinition = "TEXT")
    private String postleitzahl;

    @Column(columnDefinition = "TEXT")
    private String adresse;

    @Column(name = "fachlicher_skill", columnDefinition = "TEXT")
    private String fachlicherSkill;

    @Column(name = "fachlicher_skill_ko_kriterium", nullable = false)
    private boolean fachlicherSkillKOKriterium;

    @Column(name = "optionale_fachliche_skills", columnDefinition = "TEXT")
    private String optionalFachlicheSkills;

    @Column(name = "gehalt_mehr_info", columnDefinition = "TEXT")
    private String gehaltMehrInfo;

    @Column(name = "gehalt_ko_kriterium", nullable = false)
    private boolean gehaltKOKriterium;

    @Column(columnDefinition = "TEXT")
    private String berufserfahrung;

    @Column(columnDefinition = "TEXT")
    private String branchenkenntnisse;

    @Column(columnDefinition = "TEXT")
    private String zertifikate;

    @Column(name = "zertifikate_ko_kriterium", nullable = false)
    private boolean zertifikateKOKriterium;

    @Column(name = "optionale_zertifikate", columnDefinition = "TEXT")
    private String optionalZertifikate;

    @Enumerated(EnumType.STRING)
    private Sprachniveau deutsch;

    @Column(name = "deutsch_ko_kriterium", nullable = false)
    private boolean deutschKOKriterium;

    @Enumerated(EnumType.STRING)
    private Sprachniveau englisch;

    @Column(name = "englisch_ko_kriterium", nullable = false)
    private boolean englischKOKriterium;

    @Column(name = "sonstige_sprachen", columnDefinition = "TEXT")
    private String sonstigeSprachen;

    @Column(name = "sonstige_sprachen_ko_kriterium", nullable = false)
    private boolean sonstigeSprachenKOKriterium;

    @Column(columnDefinition = "TEXT")
    private String informationen;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @Column(name = "anlage_datum")
    private LocalDate anlageDatum;

    @Column(name = "gehalt_minimum", precision = 10, scale = 2)
    private BigDecimal gehaltMinimum;

    @Column(name = "gehalt_maximum", precision = 10, scale = 2)
    private BigDecimal gehaltMaximum;
}
