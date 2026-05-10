package com.firma.management.controller;

import com.firma.management.entity.Kandidat;
import com.firma.management.service.KandidatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/kandidat")
public class KandidatController {

    private final KandidatService service;

    public KandidatController(KandidatService service) {
        this.service = service;
    }

    @GetMapping
    public List<Kandidat> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Kandidat> getById(@PathVariable UUID id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Kandidat create(@RequestBody Kandidat k) {
        return service.create(k);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Kandidat> update(@PathVariable UUID id, @RequestBody Kandidat k) {
        return service.update(id, k)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return service.delete(id) ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}