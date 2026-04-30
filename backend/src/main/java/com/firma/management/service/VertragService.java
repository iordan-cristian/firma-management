package com.firma.management.service;

import com.firma.management.entity.Vertrag;
import com.firma.management.repository.VertragRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class VertragService {

    private final VertragRepository repo;

    public VertragService(VertragRepository repo) {
        this.repo = repo;
    }

    /** Returns all Vertraege sorted by bezahlbarAm ascending. */
    public List<Vertrag> getAll() { return repo.findAllByOrderByBezahlbarAmAsc(); }

    public Optional<Vertrag> getById(UUID id) { return repo.findById(id); }

    public List<Vertrag> getAllForFirma(UUID firmaId) {
        return repo.findAllByFirmaId(firmaId);
    }

    public List<Vertrag> getAllForAnsprechpartner(UUID ansprechpartnerId) {
        return repo.findAllByAnsprechpartnerId(ansprechpartnerId);
    }

    public Vertrag create(Vertrag v) {
        v.setId(null);
        if (v.getBezahlt() == null) v.setBezahlt(false);
        return repo.save(v);
    }

    public Optional<Vertrag> update(UUID id, Vertrag input) {
        return repo.findById(id).map(existing -> {
            existing.setAnsprechpartnerId(input.getAnsprechpartnerId());
            existing.setFirmaId(input.getFirmaId());
            existing.setSuchauftragId(input.getSuchauftragId());
            existing.setWert(input.getWert());
            existing.setBezahlbarAm(input.getBezahlbarAm());
            existing.setBezahlt(input.getBezahlt() != null ? input.getBezahlt() : existing.getBezahlt());
            return repo.save(existing);
        });
    }

    public boolean delete(UUID id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}
