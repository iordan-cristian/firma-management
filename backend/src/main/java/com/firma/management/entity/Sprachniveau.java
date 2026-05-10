package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Sprachniveau {
    A1("A1"), A2("A2"), B1("B1"), B2("B2"), C1("C1"), C2("C2"),
    MUTTERSPRACHE("Muttersprache");

    private final String label;

    Sprachniveau(String label) { this.label = label; }

    @JsonValue
    public String getLabel() { return label; }

    @JsonCreator
    public static Sprachniveau fromLabel(String value) {
        if (value == null) return null;
        for (Sprachniveau s : values()) {
            if (s.label.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown Sprachniveau: " + value);
    }
}
