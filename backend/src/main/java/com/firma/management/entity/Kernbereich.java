package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Kernbereich {
    INVESTOREN("Investoren"),
    VERTRIEB("Vertrieb"),
    IMOBILIEN("Imobilien"),
    PERSONAL("Personal");

    private final String label;

    Kernbereich(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static Kernbereich fromLabel(String value) {
        if (value == null) return null;
        for (Kernbereich k : values()) {
            if (k.label.equalsIgnoreCase(value) || k.name().equalsIgnoreCase(value)) {
                return k;
            }
        }
        throw new IllegalArgumentException("Unknown Kernbereich: " + value);
    }
}
