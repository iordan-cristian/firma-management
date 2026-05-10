package com.firma.management.service;

import com.firma.management.entity.Firma;
import com.firma.management.repository.FirmaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FirmaService {

    private final FirmaRepository repo;

    public FirmaService(FirmaRepository repo) {
        this.repo = repo;
    }

    public List<Firma> getAll() { return repo.findAll(); }

    public Optional<Firma> getById(UUID id) { return repo.findById(id); }

    public Firma create(Firma firma) {
        firma.setId(null);
        return repo.save(firma);
    }

    public Optional<Firma> update(UUID id, Firma input) {
        return repo.findById(id).map(existing -> {
            existing.setName(input.getName());
            existing.setStandort(input.getStandort());
            existing.setAllgemeinerSchwerpunkt(input.getAllgemeinerSchwerpunkt());
            existing.setEmail(input.getEmail());
            existing.setTelefon(input.getTelefon());
            existing.setMobil(input.getMobil());
            return repo.save(existing);
        });
    }

    public boolean delete(UUID id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}
