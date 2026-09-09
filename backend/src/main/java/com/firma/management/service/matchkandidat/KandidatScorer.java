package com.firma.management.service.matchkandidat;

import com.firma.management.dto.MatchKandidatResult;
import com.firma.management.entity.Kandidat;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
class KandidatScorer {

    MatchKandidatResult score(Kandidat kandidat, List<KriteriumKandidat> scoreKriterien) {
        List<String> erfuellt = new ArrayList<>();
        List<String> nichtErfuellt = new ArrayList<>();
        for (KriteriumKandidat kriteriumKandidat : scoreKriterien) {
            (kriteriumKandidat.isSatisfiedBy(kandidat) ? erfuellt : nichtErfuellt).add(kriteriumKandidat.label());
        }
        int score = erfuellt.size();
        return new MatchKandidatResult(kandidat, score, forDisplay(erfuellt), forDisplay(nichtErfuellt));
    }

    /** Frontend renders one criterion per line, so each label is prefixed with a newline. */
    private static String forDisplay(List<String> kriterienLabels) {
        return kriterienLabels.stream()
                .map(label -> "\n" + label)
                .collect(Collectors.joining(", "));
    }
}
