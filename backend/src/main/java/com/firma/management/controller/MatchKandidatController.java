package com.firma.management.controller;

import com.firma.management.dto.MatchKandidatResponse;
import com.firma.management.service.MatchKandidatService;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/match-kandidat")
public class MatchKandidatController {

    private final MatchKandidatService matchKandidatService;

    public MatchKandidatController(MatchKandidatService matchKandidatService) {
        this.matchKandidatService = matchKandidatService;
    }

    @GetMapping
    public MatchKandidatResponse matchKandidat(MatchKandidatRequest matchKandidatRequest) {
        return matchKandidatService.matchKandidat(matchKandidatRequest);
    }

    public record MatchKandidatRequest(

        @NotNull
        UUID suchauftragId
        
    ) {}
}
