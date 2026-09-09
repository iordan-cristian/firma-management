package com.firma.management.service.matchkandidat;

import com.firma.management.dto.MatchKandidatResponse;
import com.firma.management.dto.MatchKandidatResult;
import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Suchauftrag;
import com.firma.management.repository.KandidatMatchRepository;
import com.firma.management.service.SuchauftragService;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class MatchKandidatService {

    private final SuchauftragService suchauftragService;
    private final KandidatMatchRepository kandidatMatchRepository;
    private final KriterienBuilder kriterienBuilder;
    private final KandidatScorer kandidatScorer;
    private final KriterienKandidatExplanationBuilder explanationBuilder;

    public MatchKandidatService(SuchauftragService suchauftragService,
                                KandidatMatchRepository kandidatMatchRepository,
                                KriterienBuilder kriterienBuilder,
                                KandidatScorer kandidatScorer,
                                KriterienKandidatExplanationBuilder explanationBuilder) {
        this.suchauftragService = suchauftragService;
        this.kandidatMatchRepository = kandidatMatchRepository;
        this.kriterienBuilder = kriterienBuilder;
        this.kandidatScorer = kandidatScorer;
        this.explanationBuilder = explanationBuilder;
    }

    public MatchKandidatResponse matchKandidat(UUID suchauftragId) {
        Suchauftrag suchauftrag = suchauftragService.getById(suchauftragId)
                .orElseThrow(() -> new NoSuchElementException("Kein Suchauftrag gefunden: " + suchauftragId));

        List<KriteriumKandidat> scoreKriterien = kriterienBuilder.build(suchauftrag);
        List<Kandidat> kandidaten = kandidatMatchRepository.findExcludingKoKriterien(suchauftrag);
        List<MatchKandidatResult> treffer = rankByScore(kandidaten, scoreKriterien);

        String erklaerung = explanationBuilder.explain(suchauftrag, scoreKriterien);
        return new MatchKandidatResponse(erklaerung, scoreKriterien.size(), treffer);
    }

    private List<MatchKandidatResult> rankByScore(List<Kandidat> kandidaten, List<KriteriumKandidat> scoreKriterien) {
        return kandidaten.stream()
                .map(kandidat -> kandidatScorer.score(kandidat, scoreKriterien))
                .sorted(Comparator.comparing(MatchKandidatResult::getScore).reversed())
                .toList();
    }
}
