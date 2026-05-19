package com.firma.management.service;

import com.firma.management.entity.Ansprechpartner;
import com.firma.management.entity.Status;
import com.firma.management.entity.Suchauftrag;
import com.firma.management.repository.AnsprechpartnerRepository;
import com.firma.management.repository.SuchauftragRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SuchauftragService {

    private final SuchauftragRepository repo;
    private final AnsprechpartnerRepository ansprechpartnerRepo;

    public SuchauftragService(SuchauftragRepository repo, AnsprechpartnerRepository ansprechpartnerRepo) {
        this.repo = repo;
        this.ansprechpartnerRepo = ansprechpartnerRepo;
    }

    public List<Suchauftrag> getAll(Status statusFilter) {
        if (statusFilter == null) {
            return repo.findAll();
        }
        return repo.findAllByStatus(statusFilter);
    }

    public Optional<Suchauftrag> getById(UUID id) { return repo.findById(id); }

    public List<Suchauftrag> getAllForFirma(UUID firmaId) {
        List<UUID> ansprechpartnerIds = ansprechpartnerRepo.findAllByFirmaId(firmaId)
                .stream()
                .map(Ansprechpartner::getId)
                .toList();
        if (ansprechpartnerIds.isEmpty()) return Collections.emptyList();
        return repo.findAllByAnsprechpartnerIdIn(ansprechpartnerIds);
    }

    public Suchauftrag create(Suchauftrag s) {
        s.setId(null);
        return repo.save(s);
    }

    public Optional<Suchauftrag> update(UUID id, Suchauftrag input) {
        return repo.findById(id).map(existing -> {
            existing.setAnsprechpartnerId(input.getAnsprechpartnerId());
            existing.setAktivitaet(input.getAktivitaet());
            existing.setAuftragPlaceholder(input.getAuftragPlaceholder());
            existing.setOrt(input.getOrt());
            existing.setFachlicherSkill(input.getFachlicherSkill());
            existing.setGehalt(input.getGehalt());
            existing.setBerufserfahrung(input.getBerufserfahrung());
            existing.setBranchenkenntnisse(input.getBranchenkenntnisse());
            existing.setZertifikate(input.getZertifikate());
            existing.setStatus(input.getStatus());
            existing.setAnlageDatum(input.getAnlageDatum());
            return repo.save(existing);
        });
    }

    public boolean delete(UUID id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}
