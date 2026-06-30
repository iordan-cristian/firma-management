package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DokumentTyp {
    CV("CV"),
    DSGVO("DSGVO"),
    INTERVIEW("INTERVIEW");

    private final String label;

    DokumentTyp(String label) { this.label = label; }

    @JsonValue
    public String getLabel() { return label; }

    @JsonCreator
    public static DokumentTyp fromLabel(String value) {
        if (value == null) return null;
        for (DokumentTyp t : values()) {
            if (t.label.equalsIgnoreCase(value) || t.name().equalsIgnoreCase(value)) return t;
        }
        throw new IllegalArgumentException("Unknown DokumentTyp: " + value);
    }
}
