package com.firma.management.controller;

import com.firma.management.entity.Ansprechpartner;
import com.firma.management.entity.Vertrag;
import com.firma.management.service.AnsprechpartnerService;
import com.firma.management.service.VertragService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ansprechpartner")
public class AnsprechpartnerController {

    private final AnsprechpartnerService service;
    private final VertragService vertragService;

    public AnsprechpartnerController(AnsprechpartnerService service, VertragService vertragService) {
        this.service = service;
        this.vertragService = vertragService;
    }

    @GetMapping
    public List<Ansprechpartner> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ansprechpartner> getById(@PathVariable UUID id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Ansprechpartner create(@Valid @RequestBody Ansprechpartner a) {
        return service.create(a);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ansprechpartner> update(@PathVariable UUID id, @Valid @RequestBody Ansprechpartner a) {
        return service.update(id, a)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return service.delete(id) ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    /** getallVertragForAnsprechpartner. */
    @GetMapping("/{id}/vertrag")
    public List<Vertrag> getVertragForAnsprechpartner(@PathVariable("id") UUID ansprechpartnerId) {
        return vertragService.getAllForAnsprechpartner(ansprechpartnerId);
    }
}
