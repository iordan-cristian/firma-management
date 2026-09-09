package com.firma.management.dto;

import com.firma.management.entity.Suchauftrag;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MatchSuchauftragResult {
    private Suchauftrag suchauftrag;
    private Integer score;
    private String satisfiedKriterien;
    private String unsatisfiedKriterien;
}
