package com.firma.management.repository;

import com.firma.management.entity.Sprachniveau;

import java.util.ArrayList;
import java.util.List;

/**
 * Accumulates SQL condition fragments (each with {@code ?} placeholders) and the values bound to
 * them, in matching order. Fragments are AND-joined into the final {@code WHERE} clause. Shared by
 * the dynamic match repositories ({@link KandidatMatchRepository}, {@link SuchauftragMatchRepository}).
 */
class WhereClause {

    private final List<String> conditions = new ArrayList<>();
    private final List<Object> params = new ArrayList<>();

    void eq(String column, Object value) {
        conditions.add(column + " = ?");
        params.add(value);
    }

    void atMost(String column, Object value) {
        conditions.add(column + " <= ?");
        params.add(value);
    }

    void atLeast(String column, Object value) {
        conditions.add(column + " >= ?");
        params.add(value);
    }

    /** The {@code column} must contain every comma-separated term. */
    void allTermsMatch(String column, String csvTerms) {
        like(column, csvTerms, " AND ");
    }

    /** The {@code column} must contain at least one of the comma-separated terms. */
    void atLeastOneTermMatches(String column, String csvTerms) {
        like(column, csvTerms, " OR ");
    }

    private void like(String column, String csvTerms, String joiner) {
        List<String> likes = new ArrayList<>();
        for (String rawTerm : csvTerms.split(",")) {
            String term = rawTerm.trim();
            if (term.isEmpty()) {
                continue;
            }
            likes.add("LOWER(" + column + ") LIKE ?");
            params.add("%" + term.toLowerCase() + "%");
        }
        if (!likes.isEmpty()) {
            conditions.add("(" + String.join(joiner, likes) + ")");
        }
    }

    /** The {@code column} must be at or above {@code minimum} on the Sprachniveau scale. */
    void minSprachniveau(String column, Sprachniveau minimum) {
        sprachniveauIn(column, minimum, true);
    }

    /** The {@code column} must be at or below {@code maximum} on the Sprachniveau scale. */
    void maxSprachniveau(String column, Sprachniveau maximum) {
        sprachniveauIn(column, maximum, false);
    }

    private void sprachniveauIn(String column, Sprachniveau bound, boolean atLeast) {
        List<String> placeholders = new ArrayList<>();
        for (Sprachniveau level : Sprachniveau.values()) {
            boolean keep = atLeast ? level.ordinal() >= bound.ordinal() : level.ordinal() <= bound.ordinal();
            if (keep) {
                placeholders.add("?");
                params.add(level.name());
            }
        }
        conditions.add(column + " IN (" + String.join(", ", placeholders) + ")");
    }

    String whereSql() {
        return conditions.isEmpty() ? "1=1" : String.join(" AND ", conditions);
    }

    List<Object> params() {
        return params;
    }
}
