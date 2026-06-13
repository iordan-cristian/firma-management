package com.firma.management.service;

import com.firma.management.entity.Ansprechpartner;
import com.firma.management.repository.AnsprechpartnerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AnsprechpartnerService {

    private final AnsprechpartnerRepository repo;

    public AnsprechpartnerService(AnsprechpartnerRepository repo) {
        this.repo = repo;
    }

    public List<Ansprechpartner> getAll() { return repo.findAll(); }

    public Optional<Ansprechpartner> getById(UUID id) { return repo.findById(id); }

    public List<Ansprechpartner> getAllForFirma(UUID firmaId) {
        return repo.findAllByFirmaId(firmaId);
    }

    public Ansprechpartner create(Ansprechpartner a) {
        a.setId(null);
        return repo.save(a);
    }

    public Optional<Ansprechpartner> update(UUID id, Ansprechpartner input) {
        return repo.findById(id).map(existing -> {
            existing.setFirmaId(input.getFirmaId());
            existing.setVorname(input.getVorname());
            existing.setNachname(input.getNachname());
            existing.setSchwerpunkt(input.getSchwerpunkt());
            existing.setPosition(input.getPosition());
            existing.setTelefonnummer(input.getTelefonnummer());
            existing.setEmail(input.getEmail());
            existing.setKontaktinterval(input.getKontaktinterval());
            existing.setInformationen(input.getInformationen());
            existing.setLinkedinProfil(input.getLinkedinProfil());
            existing.setXingProfil(input.getXingProfil());
            return repo.save(existing);
        });
    }

    public boolean delete(UUID id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}
