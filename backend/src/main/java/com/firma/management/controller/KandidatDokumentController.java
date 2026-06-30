package com.firma.management.controller;

import com.firma.management.entity.DokumentTyp;
import com.firma.management.entity.KandidatDokument;
import com.firma.management.service.KandidatDokumentService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/kandidat/{kandidatId}/dokumente")
public class KandidatDokumentController {

    private final KandidatDokumentService service;

    public KandidatDokumentController(KandidatDokumentService service) {
        this.service = service;
    }

    @GetMapping
    public List<KandidatDokument> list(@PathVariable UUID kandidatId) {
        return service.listForKandidat(kandidatId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<KandidatDokument> upload(
            @PathVariable UUID kandidatId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "dokumentTyp", required = false) String dokumentTyp) throws IOException {
        KandidatDokument saved = service.upload(kandidatId, DokumentTyp.fromLabel(dokumentTyp), file);
        return ResponseEntity.status(201).body(saved);
    }

    @GetMapping("/{docId}/download")
    public ResponseEntity<Map<String, String>> download(
            @PathVariable UUID kandidatId,
            @PathVariable UUID docId) {
        return service.getMetadata(docId)
                .filter(d -> d.getKandidatId().equals(kandidatId))
                .map(doc -> ResponseEntity.ok(Map.of("url", service.presignedDownloadUrl(doc))))
                .orElseGet(() -> ResponseEntity.<Map<String, String>>notFound().build());
    }

    @DeleteMapping("/{docId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID kandidatId,
            @PathVariable UUID docId) {
        boolean owned = service.getMetadata(docId)
                .map(d -> d.getKandidatId().equals(kandidatId))
                .orElse(false);
        if (!owned) return ResponseEntity.notFound().build();
        service.delete(docId);
        return ResponseEntity.noContent().build();
    }
}
