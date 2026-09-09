package com.firma.management.service.matching;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Scores one target row against a list of {@link Kriterium}: the score is the number of criteria it
 * satisfies. Also produces the two display strings the frontend shows (one criterion per line).
 */
@Component
public class KriterienScorer {

    public <T> Bewertung score(T target, List<Kriterium<T>> kriterien) {
        List<String> erfuellt = new ArrayList<>();
        List<String> nichtErfuellt = new ArrayList<>();
        for (Kriterium<T> kriterium : kriterien) {
            (kriterium.isSatisfiedBy(target) ? erfuellt : nichtErfuellt).add(kriterium.label());
        }
        return new Bewertung(erfuellt.size(), forDisplay(erfuellt), forDisplay(nichtErfuellt));
    }

    /** Frontend renders one criterion per line, so each label is prefixed with a newline. */
    private static String forDisplay(List<String> kriterienLabels) {
        return kriterienLabels.stream()
                .map(label -> "\n" + label)
                .collect(Collectors.joining(", "));
    }

    /** The score plus the two display strings, ready to drop into a {@code Match*Result} DTO. */
    public record Bewertung(int score, String satisfiedKriterien, String unsatisfiedKriterien) {
    }
}
