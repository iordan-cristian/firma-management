package com.firma.management.service;

import com.firma.management.dto.KandidatUebersichtResponse;
import com.firma.management.entity.DokumentTyp;
import com.firma.management.entity.Kandidat;
import com.firma.management.entity.KandidatDokument;
import com.firma.management.entity.Verknuepfung;
import com.firma.management.entity.VerknuepfungArchiviert;
import com.firma.management.repository.KandidatDokumentRepository;
import com.firma.management.repository.KandidatRepository;
import com.firma.management.repository.VerknuepfungArchiviertRepository;
import com.firma.management.repository.VerknuepfungRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class KandidatService {

    private final KandidatRepository repo;
    private final KandidatDokumentService dokumentService;
    private final KandidatDokumentRepository dokumentRepo;
    private final VerknuepfungRepository verknuepfungRepo;
    private final VerknuepfungArchiviertRepository verknuepfungArchiviertRepo;

    public KandidatService(KandidatRepository repo, @Lazy KandidatDokumentService dokumentService,
                           KandidatDokumentRepository dokumentRepo, VerknuepfungRepository verknuepfungRepo,
                           VerknuepfungArchiviertRepository verknuepfungArchiviertRepo) {
        this.repo = repo;
        this.dokumentService = dokumentService;
        this.dokumentRepo = dokumentRepo;
        this.verknuepfungRepo = verknuepfungRepo;
        this.verknuepfungArchiviertRepo = verknuepfungArchiviertRepo;
    }

    /**
     * All Kandidaten with their current and archived Verknüpfungen (incl. Firma name and
     * Suchauftrag "Suche nach"), in four queries.
     */
    @Transactional(readOnly = true)
    public List<KandidatUebersichtResponse> getUebersicht() {
        Map<UUID, List<KandidatUebersichtResponse.VerknuepfungInfo<Verknuepfung>>> linksByKandidat =
                groupByKandidat(verknuepfungRepo.findKandidatLinksMitNamen(), Verknuepfung::getKandidatId);
        Map<UUID, List<KandidatUebersichtResponse.VerknuepfungInfo<VerknuepfungArchiviert>>> archivedLinksByKandidat =
                groupByKandidat(verknuepfungArchiviertRepo.findKandidatLinksMitNamen(), VerknuepfungArchiviert::getKandidatId);

        return getAll().stream()
                .map(k -> new KandidatUebersichtResponse(k,
                        linksByKandidat.getOrDefault(k.getId(), List.of()),
                        archivedLinksByKandidat.getOrDefault(k.getId(), List.of())))
                .toList();
    }

    /** Groups rows of [link, Firma name, sucheNach] by the link's Kandidat. */
    @SuppressWarnings("unchecked")
    private static <V> Map<UUID, List<KandidatUebersichtResponse.VerknuepfungInfo<V>>> groupByKandidat(
            List<Object[]> rows, Function<V, UUID> kandidatId) {
        return rows.stream().collect(Collectors.groupingBy(
                row -> kandidatId.apply((V) row[0]),
                Collectors.mapping(row -> new KandidatUebersichtResponse.VerknuepfungInfo<>(
                        (V) row[0], (String) row[1], (String) row[2]), Collectors.toList())));
    }

    public List<Kandidat> getAll() {
        List<Kandidat> kandidaten = repo.findAllByOrderByNachnameAscVornameAsc();
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
        k.setAnlageDatum(LocalDate.now());
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
            existing.setUmzugsbereitschaft(input.getUmzugsbereitschaft());
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
            existing.setBerufserfahrung(input.getBerufserfahrung());
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
            existing.setAllgemeinerSchwerpunktKOKriterium(input.isAllgemeinerSchwerpunktKOKriterium());
            existing.setFachlicherSkillKOKriterium(input.isFachlicherSkillKOKriterium());
            existing.setFachlicherSkillMindestensEin(input.isFachlicherSkillMindestensEin());
            existing.setGehaltKOKriterium(input.isGehaltKOKriterium());
            existing.setBerufserfahrungKOKriterium(input.isBerufserfahrungKOKriterium());
            existing.setBranchenkenntnisseKOKriterium(input.isBranchenkenntnisseKOKriterium());
            existing.setBranchenkenntnisseMindestensEin(input.isBranchenkenntnisseMindestensEin());
            existing.setZertifikateKOKriterium(input.isZertifikateKOKriterium());
            existing.setZertifikateMindestensEin(input.isZertifikateMindestensEin());
            existing.setDeutschKOKriterium(input.isDeutschKOKriterium());
            existing.setEnglischKOKriterium(input.isEnglischKOKriterium());
            existing.setSonstigeSprachenKOKriterium(input.isSonstigeSprachenKOKriterium());
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