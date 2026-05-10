package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Titel {
    DR("Dr."),
    ING("Ing.");

    private final String label;

    Titel(String label) { this.label = label; }

    @JsonValue
    public String getLabel() { return label; }

    @JsonCreator
    public static Titel fromLabel(String value) {
        if (value == null) return null;
        for (Titel t : values()) {
            if (t.label.equalsIgnoreCase(value) || t.name().equalsIgnoreCase(value)) return t;
        }
        throw new IllegalArgumentException("Unknown Titel: " + value);
    }
}
