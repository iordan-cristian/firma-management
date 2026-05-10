package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Fuehrerschein {
    VORHANDEN("vorhanden"),
    NICHT_VORHANDEN("nicht vorhanden");

    private final String label;

    Fuehrerschein(String label) { this.label = label; }

    @JsonValue
    public String getLabel() { return label; }

    @JsonCreator
    public static Fuehrerschein fromLabel(String value) {
        if (value == null) return null;
        for (Fuehrerschein f : values()) {
            if (f.label.equalsIgnoreCase(value) || f.name().equalsIgnoreCase(value)) return f;
        }
        throw new IllegalArgumentException("Unknown Fuehrerschein: " + value);
    }
}
