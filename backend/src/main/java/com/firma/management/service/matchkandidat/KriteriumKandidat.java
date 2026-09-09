package com.firma.management.service.matchkandidat;

import com.firma.management.entity.Kandidat;

import java.util.function.Predicate;

/** A single, applicable scoring criterion derived from a Suchauftrag. */
record KriteriumKandidat(String label, Predicate<Kandidat> matches) {

    boolean isSatisfiedBy(Kandidat kandidat) {
        return matches.test(kandidat);
    }
}
