package com.firma.management.controller;

import com.firma.management.entity.VerknuepfungArchiviert;
import com.firma.management.service.VerknuepfungArchiviertService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/verknuepfung-archiviert")
public class VerknuepfungArchiviertController {

    private final VerknuepfungArchiviertService service;

    public VerknuepfungArchiviertController(VerknuepfungArchiviertService service) {
        this.service = service;
    }

    @GetMapping("/kandidat/{kandidatId}")
    public List<VerknuepfungArchiviert> get(@PathVariable UUID kandidatId) {
        return service.get(kandidatId);
    }
}
