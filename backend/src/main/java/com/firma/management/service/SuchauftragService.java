package com.firma.management.service;

import com.firma.management.dto.SuchauftragUebersichtResponse;
import com.firma.management.entity.Ansprechpartner;
import com.firma.management.entity.Geschlecht;
import com.firma.management.entity.Suchauftrag;
import com.firma.management.entity.Titel;
import com.firma.management.entity.Verknuepfung;
import com.firma.management.entity.VerknuepfungArchiviert;
import com.firma.management.repository.AnsprechpartnerRepository;
import com.firma.management.repository.SuchauftragRepository;
import com.firma.management.repository.VerknuepfungArchiviertRepository;
import com.firma.management.repository.VerknuepfungRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SuchauftragService {

    private final SuchauftragRepository repo;
    private final AnsprechpartnerRepository ansprechpartnerRepo;
    private final VerknuepfungRepository verknuepfungRepo;
    private final VerknuepfungArchiviertRepository verknuepfungArchiviertRepo;

    public SuchauftragService(SuchauftragRepository repo, AnsprechpartnerRepository ansprechpartnerRepo,
                              VerknuepfungRepository verknuepfungRepo,
                              VerknuepfungArchiviertRepository verknuepfungArchiviertRepo) {
        this.repo = repo;
        this.ansprechpartnerRepo = ansprechpartnerRepo;
        this.verknuepfungRepo = verknuepfungRepo;
        this.verknuepfungArchiviertRepo = verknuepfungArchiviertRepo;
    }

    /**
     * All Suchaufträge with Firma, Ansprechpartner and linked Kandidaten (incl. Verknüpfung status),
     * current and archived, in three queries.
     */
    @Transactional(readOnly = true)
    public List<SuchauftragUebersichtResponse> getUebersicht() {
        Map<UUID, List<SuchauftragUebersichtResponse.KandidatLink<Verknuepfung>>> linksBySuchauftrag =
                groupBySuchauftrag(verknuepfungRepo.findSuchauftragLinksMitKandidat(),
                        Verknuepfung::getSuchauftragId, Verknuepfung::getKandidatId);
        Map<UUID, List<SuchauftragUebersichtResponse.KandidatLink<VerknuepfungArchiviert>>> archivedLinksBySuchauftrag =
                groupBySuchauftrag(verknuepfungArchiviertRepo.findSuchauftragLinksMitKandidat(),
                        VerknuepfungArchiviert::getSuchauftragId, VerknuepfungArchiviert::getKandidatId);

        List<SuchauftragUebersichtResponse> result = repo.findUebersicht();
        result.forEach(r -> {
            UUID id = r.getSuchauftrag().getId();
            r.setKandidaten(linksBySuchauftrag.getOrDefault(id, List.of()));
            r.setEhemaligeKandidaten(archivedLinksBySuchauftrag.getOrDefault(id, List.of()));
        });
        return result;
    }

    /** Groups rows of [link, Geschlecht, Titel, vorname, nachname] by the link's Suchauftrag. */
    @SuppressWarnings("unchecked")
    private static <V> Map<UUID, List<SuchauftragUebersichtResponse.KandidatLink<V>>> groupBySuchauftrag(
            List<Object[]> rows, Function<V, UUID> suchauftragId, Function<V, UUID> kandidatId) {
        return rows.stream().collect(Collectors.groupingBy(
                row -> suchauftragId.apply((V) row[0]),
                Collectors.mapping(row -> {
                    V v = (V) row[0];
                    return new SuchauftragUebersichtResponse.KandidatLink<>(kandidatId.apply(v),
                            (Geschlecht) row[1], (Titel) row[2], (String) row[3], (String) row[4], v);
                }, Collectors.toList())));
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
            existing.setEntfernung(input.getEntfernung());
            existing.setEntfernungKOKriterium(input.isEntfernungKOKriterium());
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
