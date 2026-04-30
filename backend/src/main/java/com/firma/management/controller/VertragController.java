package com.firma.management.controller;

import com.firma.management.entity.Vertrag;
import com.firma.management.service.VertragService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vertrag")
public class VertragController {

    private final VertragService service;

    public VertragController(VertragService service) {
        this.service = service;
    }

    /** getallVertrag — sorted by bezahlbarAm ascending. */
    @GetMapping
    public List<Vertrag> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vertrag> getById(@PathVariable UUID id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Vertrag create(@Valid @RequestBody Vertrag v) {
        return service.create(v);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vertrag> update(@PathVariable UUID id, @Valid @RequestBody Vertrag v) {
        return service.update(id, v)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return service.delete(id) ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
