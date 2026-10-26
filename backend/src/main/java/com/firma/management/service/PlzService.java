package com.firma.management.service;

import com.firma.management.repository.PlzKoordinateRepository;
import org.springframework.stereotype.Service;

/** Checks Postleitzahlen against the plz_koordinate table. */
@Service
public class PlzService {

    private final PlzKoordinateRepository repo;

    public PlzService(PlzKoordinateRepository repo) {
        this.repo = repo;
    }

    /**
     * True if the PLZ exists. Kandidat stores the PLZ as a number, so a 4-digit number gets its
     * leading zero back (1067 → 01067); Suchauftrag/Firma store text, which is only trimmed.
     */
    public boolean isGueltig(Object plz) {
        String value = normalize(plz);
        return value != null && value.matches("\\d{5}") && repo.existsById(value);
    }

    private static String normalize(Object plz) {
        if (plz == null) return null;
        if (plz instanceof Number n) return String.format("%05d", n.longValue());
        return plz.toString().trim();
    }
}
