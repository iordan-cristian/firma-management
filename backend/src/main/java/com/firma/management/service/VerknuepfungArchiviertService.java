package com.firma.management.service;

import com.firma.management.entity.VerknuepfungArchiviert;
import com.firma.management.repository.VerknuepfungArchiviertRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class VerknuepfungArchiviertService {

    private final VerknuepfungArchiviertRepository repo;

    public VerknuepfungArchiviertService(VerknuepfungArchiviertRepository repo) {
        this.repo = repo;
    }

    public List<VerknuepfungArchiviert> get(UUID kandidatId) {
        return repo.findAllByKandidatId(kandidatId);
    }
}
