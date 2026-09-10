package com.firma.management.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum VerknuepfungStatus {
    SELBSTBEWORBEN("Selbstbeworben", 1),
    NOGO("No-Go", 6),
    VORGESTELLT("Vorgestellt", 10),
    ABGESAGT("Abgesagt", 20),
    PROZESS_START("Prozess Start", 30),
    PROZESS_LAUFEND("Prozess laufend", 40),
    PROZESS_BEIDERSEITIGE_ZUSAGE("Prozess beiderseitige Zusage", 50),
    PROZESS_RECHNUNG_VOLLSTAENDIG_BEZAHLT("Prozess Rechnung vollständig bezahlt", 60);

    private final String label;
    private final int code;

    VerknuepfungStatus(String label, int code) {
        this.label = label;
        this.code = code;
    }

    @JsonValue
    public String getLabel() { return label; }

    /** Numeric ordering value (1..60), ascending through the recruiting pipeline. */
    public int getCode() { return code; }

    @JsonCreator
    public static VerknuepfungStatus fromLabel(String value) {
        if (value == null) return null;
        for (VerknuepfungStatus s : values()) {
            if (s.label.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown VerknuepfungStatus: " + value);
    }
}
