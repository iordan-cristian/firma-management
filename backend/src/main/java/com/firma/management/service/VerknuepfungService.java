package com.firma.management.service;

import com.firma.management.dto.VerknuepfungKandidatResponse;
import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Verknuepfung;
import com.firma.management.repository.KandidatRepository;
import com.firma.management.repository.VerknuepfungRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class VerknuepfungService {

    private final VerknuepfungRepository repo;
    private final KandidatRepository kandidatRepo;

    public VerknuepfungService(VerknuepfungRepository repo, KandidatRepository kandidatRepo) {
        this.repo = repo;
        this.kandidatRepo = kandidatRepo;
    }

    public Verknuepfung create(Verknuepfung v) {
        if (v.getSuchauftragId() != null && v.getKandidatId() != null
                && repo.existsBySuchauftragIdAndKandidatId(v.getSuchauftragId(), v.getKandidatId())) {
            throw new IllegalArgumentException("Verknüpfung existiert bereits.");
        }
        v.setId(null);
        return repo.save(v);
    }

    public List<VerknuepfungKandidatResponse> getKandidatenForSuchauftrag(UUID suchauftragId) {
        List<Verknuepfung> links = repo.findAllBySuchauftragId(suchauftragId);

        List<UUID> kandidatIds = links.stream()
                .map(Verknuepfung::getKandidatId)
                .filter(java.util.Objects::nonNull)
                .toList();

        Map<UUID, Kandidat> kandidatenById = kandidatRepo.findAllById(kandidatIds).stream()
                .collect(java.util.stream.Collectors.toMap(Kandidat::getId, Function.identity()));

        return kandidatIds.stream()
                .map(kandidatenById::get)
                .filter(java.util.Objects::nonNull)
                .map(k -> new VerknuepfungKandidatResponse(k.getId(), k.getVorname(), k.getNachname(), k.getAktuellePosition()))
                .toList();
    }

    @Transactional
    public void deleteLink(UUID suchauftragId, UUID kandidatId) {
        repo.deleteBySuchauftragIdAndKandidatId(suchauftragId, kandidatId);
    }
}
