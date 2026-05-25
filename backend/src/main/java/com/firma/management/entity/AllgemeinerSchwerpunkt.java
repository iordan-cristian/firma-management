package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AllgemeinerSchwerpunkt {
    GEBAEUDETECHNIK("Gebäudetechnik"),
    ENERGIETECHNIK("Energietechnik"),
    MASCHINENBAU("Maschinenbau"),
    INFORMATIK("Informatik"),
    KAUFMAENNISCH("Kaufmännisch");

    private final String label;

    AllgemeinerSchwerpunkt(String label) { this.label = label; }

    @JsonValue
    public String getLabel() { return label; }

    @JsonCreator
    public static AllgemeinerSchwerpunkt fromLabel(String value) {
        if (value == null) return null;
        for (AllgemeinerSchwerpunkt a : values()) {
            if (a.label.equalsIgnoreCase(value) || a.name().equalsIgnoreCase(value)) return a;
        }
        throw new IllegalArgumentException("Unknown AllgemeinerSchwerpunkt: " + value);
    }
}