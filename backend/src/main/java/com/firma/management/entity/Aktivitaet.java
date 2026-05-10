package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Aktivitaet {
    INVESTOREN("Investoren"),
    VERTRIEB("Vertrieb"),
    IMOBILIEN("Imobilien"),
    PERSONAL("Personal");

    private final String label;

    Aktivitaet(String label) { this.label = label; }

    @JsonValue
    public String getLabel() { return label; }

    @JsonCreator
    public static Aktivitaet fromLabel(String value) {
        if (value == null) return null;
        for (Aktivitaet a : values()) {
            if (a.label.equalsIgnoreCase(value) || a.name().equalsIgnoreCase(value)) return a;
        }
        throw new IllegalArgumentException("Unknown Aktivitaet: " + value);
    }
}