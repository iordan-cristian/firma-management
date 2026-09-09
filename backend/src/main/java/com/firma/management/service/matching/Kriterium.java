package com.firma.management.service.matching;

import java.util.function.Predicate;

/**
 * A single, applicable scoring criterion: a human-readable label plus the test it applies to one
 * target row of type {@code T} (a {@code Kandidat} for the forward match, a {@code Suchauftrag} for
 * the reverse match).
 */
public record Kriterium<T>(String label, Predicate<T> matches) {

    public boolean isSatisfiedBy(T target) {
        return matches.test(target);
    }
}
