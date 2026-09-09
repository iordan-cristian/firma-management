package com.firma.management.controller;

import com.firma.management.dto.MatchSuchauftragResponse;
import com.firma.management.service.matchsuchauftrag.MatchSuchauftragService;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/match-suchauftrag")
public class MatchSuchauftragController {

    private final MatchSuchauftragService matchSuchauftragService;

    public MatchSuchauftragController(MatchSuchauftragService matchSuchauftragService) {
        this.matchSuchauftragService = matchSuchauftragService;
    }

    @GetMapping
    public MatchSuchauftragResponse matchSuchauftrag(MatchSuchauftragRequest matchSuchauftragRequest) {
        return matchSuchauftragService.matchSuchauftrag(matchSuchauftragRequest.kandidatId());
    }

    public record MatchSuchauftragRequest(

        @NotNull
        UUID kandidatId

    ) {}
}
