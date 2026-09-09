package com.firma.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MatchSuchauftragResponse {
    private String kriterienExplained;
    private Integer maxScore;
    private List<MatchSuchauftragResult> results;
}
