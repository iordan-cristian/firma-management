package com.firma.management.controller;

import com.firma.management.dto.VerknuepfungKandidatResponse;
import com.firma.management.entity.Verknuepfung;
import com.firma.management.service.VerknuepfungService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/verknuepfung")
public class VerknuepfungController {

    private final VerknuepfungService service;

    public VerknuepfungController(VerknuepfungService service) {
        this.service = service;
    }

    @PostMapping
    public Verknuepfung create(@RequestBody Verknuepfung v) {
        return service.create(v);
    }

    @GetMapping("/suchauftrag/{suchauftragId}")
    public List<VerknuepfungKandidatResponse> getKandidatenForSuchauftrag(@PathVariable UUID suchauftragId) {
        return service.getKandidatenForSuchauftrag(suchauftragId);
    }

    @DeleteMapping("/suchauftrag/{suchauftragId}/kandidat/{kandidatId}")
    public ResponseEntity<Void> deleteLink(@PathVariable UUID suchauftragId, @PathVariable UUID kandidatId) {
        service.deleteLink(suchauftragId, kandidatId);
        return ResponseEntity.noContent().build();
    }
}
