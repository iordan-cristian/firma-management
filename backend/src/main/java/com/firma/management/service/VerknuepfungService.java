package com.firma.management.service;

import com.firma.management.dto.VerknuepfungKandidatResponse;
import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Verknuepfung;
import com.firma.management.entity.VerknuepfungArchiviert;
import com.firma.management.repository.KandidatRepository;
import com.firma.management.repository.VerknuepfungArchiviertRepository;
import com.firma.management.repository.VerknuepfungRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class VerknuepfungService {

    private final VerknuepfungRepository repo;
    private final VerknuepfungArchiviertRepository archivRepo;
    private final KandidatRepository kandidatRepo;

    public VerknuepfungService(VerknuepfungRepository repo, VerknuepfungArchiviertRepository archivRepo,
                               KandidatRepository kandidatRepo) {
        this.repo = repo;
        this.archivRepo = archivRepo;
        this.kandidatRepo = kandidatRepo;
    }

    public Verknuepfung create(Verknuepfung v) {
        if (v.getSuchauftragId() != null && v.getKandidatId() != null
                && repo.existsBySuchauftragIdAndKandidatId(v.getSuchauftragId(), v.getKandidatId())) {
            throw new IllegalArgumentException("Verknüpfung existiert bereits.");
        }
        v.setId(null);
        v.setStatusGeaendertAm(LocalDate.now());
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

    public java.util.Optional<Verknuepfung> update(UUID id, Verknuepfung input) {
        return repo.findById(id).map(existing -> {
            existing.setGebuehren(input.getGebuehren());
            existing.setMainAnteil(input.getMainAnteil());
            // The Bestand derives "Prozess beendet am" from this date
            if (existing.getVerknuepfungStatus() != input.getVerknuepfungStatus()) {
                existing.setStatusGeaendertAm(LocalDate.now());
            }
            existing.setVerknuepfungStatus(input.getVerknuepfungStatus());
            existing.setVerknuepfungStatusKommentar(input.getVerknuepfungStatusKommentar());
            return repo.save(existing);
        });
    }

    @Transactional
    public void deleteLink(UUID suchauftragId, UUID kandidatId) {
        repo.deleteBySuchauftragIdAndKandidatId(suchauftragId, kandidatId);
    }

    /**
     * Moves all Verknüpfungen of the Kandidat to verknuepfung_archiviert. Without Verknüpfungen
     * its process is open again, so it shows up "clean" in the current month.
     */
    @Transactional
    public boolean reaktivieren(UUID kandidatId) {
        if (!kandidatRepo.existsById(kandidatId)) return false;
        List<Verknuepfung> links = repo.findAllByKandidatId(kandidatId);
        LocalDate heute = LocalDate.now();
        archivRepo.saveAll(links.stream().map(l -> VerknuepfungArchiviert.of(l, heute)).toList());
        repo.deleteAll(links);
        return true;
    }
}
