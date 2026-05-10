package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Geschlecht {
    MAENNLICH("männlich"),
    WEIBLICH("weiblich"),
    DIVERS("divers"),
    BEVORZUGE_NICHT_ZU_SAGEN("Bevorzuge nicht zu sagen");

    private final String label;

    Geschlecht(String label) { this.label = label; }

    @JsonValue
    public String getLabel() { return label; }

    @JsonCreator
    public static Geschlecht fromLabel(String value) {
        if (value == null) return null;
        for (Geschlecht g : values()) {
            if (g.label.equalsIgnoreCase(value) || g.name().equalsIgnoreCase(value)) return g;
        }
        throw new IllegalArgumentException("Unknown Geschlecht: " + value);
    }
}
