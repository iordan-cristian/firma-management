package com.firma.management.controller;

import com.firma.management.entity.Status;
import com.firma.management.entity.Suchauftrag;
import com.firma.management.service.SuchauftragService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/suchauftrag")
public class SuchauftragController {

    private final SuchauftragService service;

    public SuchauftragController(SuchauftragService service) {
        this.service = service;
    }

    /**
     * getallSuchauftrag — optional `status` query parameter filters by status.
     * Accepts the label form ("in Arbeit", "Fertig") or the enum name (IN_ARBEIT, FERTIG).
     */
    @GetMapping
    public List<Suchauftrag> getAll(@RequestParam(value = "status", required = false) String status) {
        Status statusEnum = (status == null || status.isBlank()) ? null : Status.fromLabel(status);
        return service.getAll(statusEnum);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Suchauftrag> getById(@PathVariable UUID id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Suchauftrag create(@Valid @RequestBody Suchauftrag s) {
        return service.create(s);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Suchauftrag> update(@PathVariable UUID id, @Valid @RequestBody Suchauftrag s) {
        return service.update(id, s)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return service.delete(id) ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
