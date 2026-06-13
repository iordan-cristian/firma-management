package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "kandidat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Kandidat {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @Column(name = "dsgvo_bestaetigungs_datum")
    private LocalDate dsgvoBestaetigungsDatum;

    @Enumerated(EnumType.STRING)
    private Geschlecht geschlecht;

    @Enumerated(EnumType.STRING)
    private Titel titel;

    @Column(columnDefinition = "TEXT")
    private String vorname;

    @Column(columnDefinition = "TEXT")
    private String nachname;

    private Integer postleitzahl;

    @Column(columnDefinition = "TEXT")
    private String ort;

    private Integer geburtsjahr;

    @Column(columnDefinition = "TEXT")
    private String staatsangehoerigkeit;

    @Column(columnDefinition = "TEXT")
    private String familienstand;

    @Column(columnDefinition = "TEXT")
    private String kinder;

    @Column(columnDefinition = "TEXT")
    private String wochenstunden;

    @Column(columnDefinition = "TEXT")
    private String gehaltsrange;

    @Column(columnDefinition = "TEXT")
    private String wochenendbereitschaft;

    @Column(columnDefinition = "TEXT")
    private String homeoffice;

    @Column(columnDefinition = "TEXT")
    private String firmenwagenregelung;

    @Column(name = "reisetaetigkeiten_mit_uebernachtung", columnDefinition = "TEXT")
    private String reisetaetigkeitenMitUebernachtung;

    @Enumerated(EnumType.STRING)
    private Sprachniveau deutsch;

    @Enumerated(EnumType.STRING)
    private Sprachniveau englisch;

    @Column(name = "sonstige_sprachen", columnDefinition = "TEXT")
    private String sonstigeSprachen;

    @Column(columnDefinition = "TEXT")
    private String hochschulabschluss;

    @Column(columnDefinition = "TEXT")
    private String berufsausbildung;

    @Enumerated(EnumType.STRING)
    private Fuehrerschein autofuehrerschein;

    @Column(name = "fachspezifische_zertifikate", columnDefinition = "TEXT")
    private String fachspezifischeZertifikate;

    @Column(name = "taegliche_fahrzeit")
    private Integer taeglicheFahrzeit;

    @Column(columnDefinition = "TEXT")
    private String branchenkenntnisse;

    @Column(name = "aktuelle_taetigkeiten", columnDefinition = "TEXT")
    private String aktuelleTaetigkeiten;

    @Column(name = "aktuelle_position", columnDefinition = "TEXT")
    private String aktuellePosition;

    @Column(columnDefinition = "TEXT")
    private String wechselgruende;

    @Column(name = "zukuenftige_position_taetigkeiten", columnDefinition = "TEXT")
    private String zukuenftigePositionTaetigkeiten;

    @Column(columnDefinition = "TEXT")
    private String kuendigungsfrist;

    @Column(name = "erstes_online_meeting", columnDefinition = "TEXT")
    private String erstesOnlineMeeting;

    @Enumerated(EnumType.STRING)
    @Column(name = "allgemeiner_schwerpunkt")
    private AllgemeinerSchwerpunkt allgemeinerSchwerpunkt;

    @Column(name = "fachlicher_skill", columnDefinition = "TEXT")
    private String fachlicherSkill;

    @Column(name = "firmen_selbevorben", columnDefinition = "TEXT")
    private String firmenSelbevorben;

    @Column(name = "firmen_nogo", columnDefinition = "TEXT")
    private String firmenNogo;
}
