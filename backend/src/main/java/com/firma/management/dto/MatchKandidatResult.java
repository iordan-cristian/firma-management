package com.firma.management.dto;

import com.firma.management.entity.Kandidat;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MatchKandidatResult {
    private Kandidat kandidat;
    private Integer score;
    private String satisfiedKriterien;
    private String unsatisfiedKriterien;
}
