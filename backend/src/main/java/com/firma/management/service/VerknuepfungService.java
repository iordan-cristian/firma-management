package com.firma.management.service;

import com.firma.management.dto.VerknuepfungKandidatResponse;
import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Verknuepfung;
import com.firma.management.entity.VerknuepfungStatus;
import com.firma.management.repository.KandidatRepository;
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
        Verknuepfung saved = repo.save(v);
        updateProzessBeendetAm(saved.getKandidatId());
        return saved;
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

    public List<Verknuepfung> getVerknuepfungenForKandidat(UUID kandidatId) {
        return repo.findAllByKandidatId(kandidatId);
    }

    public java.util.Optional<Verknuepfung> update(UUID id, Verknuepfung input) {
        return repo.findById(id).map(existing -> {
            existing.setGebuehren(input.getGebuehren());
            existing.setMainAnteil(input.getMainAnteil());
            existing.setVerknuepfungStatus(input.getVerknuepfungStatus());
            existing.setVerknuepfungStatusKommentar(input.getVerknuepfungStatusKommentar());
            Verknuepfung saved = repo.save(existing);
            updateProzessBeendetAm(saved.getKandidatId());
            return saved;
        });
    }

    @Transactional
    public void deleteLink(UUID suchauftragId, UUID kandidatId) {
        repo.deleteBySuchauftragIdAndKandidatId(suchauftragId, kandidatId);
        // Deleting an open Verknüpfung can leave only Abgesagt ones
        updateProzessBeendetAm(kandidatId);
    }

    /**
     * Sets the Kandidat's prozessBeendetAm to today once its process is finished.
     * An already set date is kept (reopening a process is not handled here).
     */
    private void updateProzessBeendetAm(UUID kandidatId) {
        if (kandidatId == null) return;
        kandidatRepo.findById(kandidatId)
                .filter(k -> k.getProzessBeendetAm() == null)
                .filter(k -> isProzessBeendet(repo.findAllByKandidatId(kandidatId)))
                .ifPresent(k -> {
                    k.setProzessBeendetAm(LocalDate.now());
                    kandidatRepo.save(k);
                });
    }

    /** Finished = one Verknüpfung fully paid, or at least one Verknüpfung and all of them Abgesagt. */
    static boolean isProzessBeendet(List<Verknuepfung> links) {
        if (links.isEmpty()) return false;
        return links.stream().anyMatch(l -> l.getVerknuepfungStatus() == VerknuepfungStatus.PROZESS_RECHNUNG_VOLLSTAENDIG_BEZAHLT)
                || links.stream().allMatch(l -> l.getVerknuepfungStatus() == VerknuepfungStatus.ABGESAGT);
    }
}
