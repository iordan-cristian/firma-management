package com.firma.management.controller;

import com.firma.management.entity.Ansprechpartner;
import com.firma.management.service.AnsprechpartnerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ansprechpartner")
public class AnsprechpartnerController {

    private final AnsprechpartnerService service;

    public AnsprechpartnerController(AnsprechpartnerService service) {
        this.service = service;
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
}
