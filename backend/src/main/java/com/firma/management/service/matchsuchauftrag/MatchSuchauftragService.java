package com.firma.management.service.matchsuchauftrag;

import com.firma.management.dto.MatchSuchauftragResponse;
import com.firma.management.dto.MatchSuchauftragResult;
import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Suchauftrag;
import com.firma.management.repository.SuchauftragMatchRepository;
import com.firma.management.service.KandidatService;
import com.firma.management.service.matching.Kriterium;
import com.firma.management.service.matching.KriterienScorer;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

/**
 * Reverse of {@code MatchKandidatService}: given a Kandidat, return the open Suchaufträge that pass
 * its KO criteria, ranked by how many of its soft criteria they satisfy.
 */
@Service
public class MatchSuchauftragService {

    private final KandidatService kandidatService;
    private final SuchauftragMatchRepository suchauftragMatchRepository;
    private final KriterienSuchauftragBuilder kriterienBuilder;
    private final KriterienScorer kriterienScorer;
    private final KriterienSuchauftragExplanationBuilder explanationBuilder;

    public MatchSuchauftragService(KandidatService kandidatService,
                                   SuchauftragMatchRepository suchauftragMatchRepository,
                                   KriterienSuchauftragBuilder kriterienBuilder,
                                   KriterienScorer kriterienScorer,
                                   KriterienSuchauftragExplanationBuilder explanationBuilder) {
        this.kandidatService = kandidatService;
        this.suchauftragMatchRepository = suchauftragMatchRepository;
        this.kriterienBuilder = kriterienBuilder;
        this.kriterienScorer = kriterienScorer;
        this.explanationBuilder = explanationBuilder;
    }

    public MatchSuchauftragResponse matchSuchauftrag(UUID kandidatId) {
        Kandidat kandidat = kandidatService.getById(kandidatId)
                .orElseThrow(() -> new NoSuchElementException("Kein Kandidat gefunden: " + kandidatId));

        List<Kriterium<Suchauftrag>> scoreKriterien = kriterienBuilder.build(kandidat);
        List<Suchauftrag> suchauftraege = suchauftragMatchRepository.findExcludingKoKriterien(kandidat);
        List<MatchSuchauftragResult> treffer = rankByScore(suchauftraege, scoreKriterien);

        String erklaerung = explanationBuilder.explain(kandidat, scoreKriterien);
        return new MatchSuchauftragResponse(erklaerung, scoreKriterien.size(), treffer);
    }

    private List<MatchSuchauftragResult> rankByScore(List<Suchauftrag> suchauftraege,
                                                     List<Kriterium<Suchauftrag>> scoreKriterien) {
        return suchauftraege.stream()
                .map(suchauftrag -> {
                    KriterienScorer.Bewertung b = kriterienScorer.score(suchauftrag, scoreKriterien);
                    return new MatchSuchauftragResult(suchauftrag, b.score(), b.satisfiedKriterien(), b.unsatisfiedKriterien());
                })
                .sorted(Comparator.comparing(MatchSuchauftragResult::getScore).reversed())
                .toList();
    }
}
