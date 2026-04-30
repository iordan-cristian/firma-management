package com.firma.management.controller;

import com.firma.management.entity.Ansprechpartner;
import com.firma.management.entity.Firma;
import com.firma.management.entity.Suchauftrag;
import com.firma.management.entity.Vertrag;
import com.firma.management.service.AnsprechpartnerService;
import com.firma.management.service.FirmaService;
import com.firma.management.service.SuchauftragService;
import com.firma.management.service.VertragService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/firma")
public class FirmaController {

    private final FirmaService firmaService;
    private final AnsprechpartnerService ansprechpartnerService;
    private final SuchauftragService suchauftragService;
    private final VertragService vertragService;

    public FirmaController(FirmaService firmaService,
                           AnsprechpartnerService ansprechpartnerService,
                           SuchauftragService suchauftragService,
                           VertragService vertragService) {
        this.firmaService = firmaService;
        this.ansprechpartnerService = ansprechpartnerService;
        this.suchauftragService = suchauftragService;
        this.vertragService = vertragService;
    }

    /** getallFirma — return all entries in Firma. */
    @GetMapping
    public List<Firma> getAll() {
        return firmaService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Firma> getById(@PathVariable UUID id) {
        return firmaService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Firma create(@Valid @RequestBody Firma firma) {
        return firmaService.create(firma);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Firma> update(@PathVariable UUID id, @Valid @RequestBody Firma firma) {
        return firmaService.update(id, firma)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return firmaService.delete(id) ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    /** getallAnsprechpartnerForFirma. */
    @GetMapping("/{id}/ansprechpartner")
    public List<Ansprechpartner> getAnsprechpartnerForFirma(@PathVariable("id") UUID firmaId) {
        return ansprechpartnerService.getAllForFirma(firmaId);
    }

    /** getallSuchauftragForFirma. */
    @GetMapping("/{id}/suchauftrag")
    public List<Suchauftrag> getSuchauftragForFirma(@PathVariable("id") UUID firmaId) {
        return suchauftragService.getAllForFirma(firmaId);
    }

    /** getallVertragForFirma. */
    @GetMapping("/{id}/vertrag")
    public List<Vertrag> getVertragForFirma(@PathVariable("id") UUID firmaId) {
        return vertragService.getAllForFirma(firmaId);
    }
}
