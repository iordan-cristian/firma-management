package com.firma.management.service;

import com.firma.management.dto.SuchauftragUebersichtResponse;
import com.firma.management.entity.Ansprechpartner;
import com.firma.management.entity.Firma;
import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Status;
import com.firma.management.entity.Suchauftrag;
import com.firma.management.entity.Verknuepfung;
import com.firma.management.repository.AnsprechpartnerRepository;
import com.firma.management.repository.FirmaRepository;
import com.firma.management.repository.KandidatRepository;
import com.firma.management.repository.SuchauftragRepository;
import com.firma.management.repository.VerknuepfungRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SuchauftragService {

    private final SuchauftragRepository repo;
    private final AnsprechpartnerRepository ansprechpartnerRepo;
    private final FirmaRepository firmaRepo;
    private final KandidatRepository kandidatRepo;
    private final VerknuepfungRepository verknuepfungRepo;

    public SuchauftragService(SuchauftragRepository repo, AnsprechpartnerRepository ansprechpartnerRepo,
                              FirmaRepository firmaRepo, KandidatRepository kandidatRepo,
                              VerknuepfungRepository verknuepfungRepo) {
        this.repo = repo;
        this.ansprechpartnerRepo = ansprechpartnerRepo;
        this.firmaRepo = firmaRepo;
        this.kandidatRepo = kandidatRepo;
        this.verknuepfungRepo = verknuepfungRepo;
    }

    /** All Suchaufträge with Firma, Ansprechpartner and linked Kandidaten (incl. Verknüpfung status), one query per table. */
    @Transactional(readOnly = true)
    public List<SuchauftragUebersichtResponse> getUebersicht() {
        Map<UUID, Ansprechpartner> ansprechpartnerById = ansprechpartnerRepo.findAll().stream()
                .collect(Collectors.toMap(Ansprechpartner::getId, Function.identity()));
        Map<UUID, String> firmaNameById = firmaRepo.findAll().stream()
                .filter(f -> f.getName() != null)
                .collect(Collectors.toMap(Firma::getId, Firma::getName));

        List<Verknuepfung> links = verknuepfungRepo.findAll().stream()
                .filter(v -> v.getSuchauftragId() != null && v.getKandidatId() != null)
                .toList();
        Map<UUID, List<Verknuepfung>> linksBySuchauftrag = links.stream()
                .collect(Collectors.groupingBy(Verknuepfung::getSuchauftragId));
        Map<UUID, Kandidat> kandidatById = kandidatRepo.findAllById(
                        links.stream().map(Verknuepfung::getKandidatId).distinct().toList()).stream()
                .collect(Collectors.toMap(Kandidat::getId, Function.identity()));

        return repo.findAll().stream().map(s -> {
            Ansprechpartner ap = ansprechpartnerById.get(s.getAnsprechpartnerId());
            List<SuchauftragUebersichtResponse.KandidatLink> kandidaten =
                    linksBySuchauftrag.getOrDefault(s.getId(), List.of()).stream()
                            .map(v -> {
                                Kandidat k = kandidatById.get(v.getKandidatId());
                                if (k == null) return null;
                                return new SuchauftragUebersichtResponse.KandidatLink(k.getId(), k.getGeschlecht(),
                                        k.getTitel(), k.getVorname(), k.getNachname(), v);
                            })
                            .filter(Objects::nonNull)
                            .toList();
            return new SuchauftragUebersichtResponse(
                    s,
                    ap != null ? firmaNameById.get(ap.getFirmaId()) : null,
                    ap != null ? ap.getGeschlecht() : null,
                    ap != null ? ap.getTitel() : null,
                    ap != null ? ap.getVorname() : null,
                    ap != null ? ap.getNachname() : null,
                    kandidaten);
        }).toList();
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
            existing.setSucheNach(input.getSucheNach());
            existing.setOrt(input.getOrt());
            existing.setPostleitzahl(input.getPostleitzahl());
            existing.setAdresse(input.getAdresse());
            existing.setAllgemeinerSchwerpunkt(input.getAllgemeinerSchwerpunkt());
            existing.setAllgemeinerSchwerpunktKOKriterium(input.isAllgemeinerSchwerpunktKOKriterium());
            existing.setFachlicherSkill(input.getFachlicherSkill());
            existing.setFachlicherSkillKOKriterium(input.isFachlicherSkillKOKriterium());
            existing.setFachlicherSkillMindestensEin(input.isFachlicherSkillMindestensEin());
            existing.setOptionalFachlicheSkills(input.getOptionalFachlicheSkills());
            existing.setGehaltMehrInfo(input.getGehaltMehrInfo());
            existing.setGehaltKOKriterium(input.isGehaltKOKriterium());
            existing.setBerufserfahrung(input.getBerufserfahrung());
            existing.setBerufserfahrungKOKriterium(input.isBerufserfahrungKOKriterium());
            existing.setBranchenkenntnisse(input.getBranchenkenntnisse());
            existing.setBranchenkenntnisseKOKriterium(input.isBranchenkenntnisseKOKriterium());
            existing.setBranchenkenntnisseMindestensEin(input.isBranchenkenntnisseMindestensEin());
            existing.setOptionalBranchenkenntnisse(input.getOptionalBranchenkenntnisse());
            existing.setZertifikate(input.getZertifikate());
            existing.setZertifikateKOKriterium(input.isZertifikateKOKriterium());
            existing.setZertifikateMindestensEin(input.isZertifikateMindestensEin());
            existing.setOptionalZertifikate(input.getOptionalZertifikate());
            existing.setDeutsch(input.getDeutsch());
            existing.setDeutschKOKriterium(input.isDeutschKOKriterium());
            existing.setEnglisch(input.getEnglisch());
            existing.setEnglischKOKriterium(input.isEnglischKOKriterium());
            existing.setSonstigeSprachen(input.getSonstigeSprachen());
            existing.setSonstigeSprachenKOKriterium(input.isSonstigeSprachenKOKriterium());
            existing.setInformationen(input.getInformationen());
            existing.setStatus(input.getStatus());
            existing.setAnlageDatum(input.getAnlageDatum());
            existing.setGehaltMinimum(input.getGehaltMinimum());
            existing.setGehaltMaximum(input.getGehaltMaximum());
            return repo.save(existing);
        });
    }

    public boolean delete(UUID id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}
