package com.firma.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class VerknuepfungKandidatResponse {
    private UUID kandidatId;
    private String vorname;
    private String nachname;
    private String position;
}
