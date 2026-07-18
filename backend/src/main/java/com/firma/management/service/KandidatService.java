package com.firma.management.service;

import com.firma.management.entity.DokumentTyp;
import com.firma.management.entity.Kandidat;
import com.firma.management.entity.KandidatDokument;
import com.firma.management.repository.KandidatDokumentRepository;
import com.firma.management.repository.KandidatRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class KandidatService {

    private final KandidatRepository repo;
    private final KandidatDokumentService dokumentService;
    private final KandidatDokumentRepository dokumentRepo;

    public KandidatService(KandidatRepository repo, @Lazy KandidatDokumentService dokumentService,
                           KandidatDokumentRepository dokumentRepo) {
        this.repo = repo;
        this.dokumentService = dokumentService;
        this.dokumentRepo = dokumentRepo;
    }

    public List<Kandidat> getAll() {
        List<Kandidat> kandidaten = repo.findAll();
        Map<UUID, Set<DokumentTyp>> typMap = new HashMap<>();
        for (KandidatDokument d : dokumentRepo.findAll()) {
            typMap.computeIfAbsent(d.getKandidatId(), k -> new HashSet<>()).add(d.getDokumentTyp());
        }
        kandidaten.forEach(k -> k.setDokumentTypen(typMap.getOrDefault(k.getId(), Set.of())));
        return kandidaten;
    }

    public Optional<Kandidat> getById(UUID id) { return repo.findById(id); }

    public Kandidat create(Kandidat k) {
        k.setId(null);
        return repo.save(k);
    }

    public Optional<Kandidat> update(UUID id, Kandidat input) {
        return repo.findById(id).map(existing -> {
            existing.setDsgvoBestaetigungsDatum(input.getDsgvoBestaetigungsDatum());
            existing.setGeschlecht(input.getGeschlecht());
            existing.setTitel(input.getTitel());
            existing.setVorname(input.getVorname());
            existing.setNachname(input.getNachname());
            existing.setPostleitzahl(input.getPostleitzahl());
            existing.setOrt(input.getOrt());
            existing.setGeburtsjahr(input.getGeburtsjahr());
            existing.setStaatsangehoerigkeit(input.getStaatsangehoerigkeit());
            existing.setFamilienstand(input.getFamilienstand());
            existing.setKinder(input.getKinder());
            existing.setWochenstunden(input.getWochenstunden());
            existing.setWochenendbereitschaft(input.getWochenendbereitschaft());
            existing.setHomeoffice(input.getHomeoffice());
            existing.setFirmenwagenregelung(input.getFirmenwagenregelung());
            existing.setReisetaetigkeitenMitUebernachtung(input.getReisetaetigkeitenMitUebernachtung());
            existing.setDeutsch(input.getDeutsch());
            existing.setEnglisch(input.getEnglisch());
            existing.setSonstigeSprachen(input.getSonstigeSprachen());
            existing.setHochschulabschluss(input.getHochschulabschluss());
            existing.setBerufsausbildung(input.getBerufsausbildung());
            existing.setAutofuehrerschein(input.getAutofuehrerschein());
            existing.setZertifikate(input.getZertifikate());
            existing.setTaeglicheFahrzeit(input.getTaeglicheFahrzeit());
            existing.setBranchenkenntnisse(input.getBranchenkenntnisse());
            existing.setAktuelleTaetigkeiten(input.getAktuelleTaetigkeiten());
            existing.setAktuellePosition(input.getAktuellePosition());
            existing.setAktuelleFirma(input.getAktuelleFirma());
            existing.setWechselgruende(input.getWechselgruende());
            existing.setZukuenftigePositionTaetigkeiten(input.getZukuenftigePositionTaetigkeiten());
            existing.setKuendigungsfrist(input.getKuendigungsfrist());
            existing.setErstesOnlineMeeting(input.getErstesOnlineMeeting());
            existing.setAllgemeinerSchwerpunkt(input.getAllgemeinerSchwerpunkt());
            existing.setFachlicherSkill(input.getFachlicherSkill());
            existing.setFirmenSelbevorben(input.getFirmenSelbevorben());
            existing.setFirmenNogo(input.getFirmenNogo());
            existing.setEmail(input.getEmail());
            existing.setTelefon(input.getTelefon());
            existing.setLinkedinProfil(input.getLinkedinProfil());
            existing.setXingProfil(input.getXingProfil());
            existing.setGehaltMinimum(input.getGehaltMinimum());
            existing.setGehaltMaximum(input.getGehaltMaximum());
            return repo.save(existing);
        });
    }

    public boolean delete(UUID id) {
        if (!repo.existsById(id)) return false;
        dokumentService.deleteAllForKandidat(id);
        repo.deleteById(id);
        return true;
    }
}