package com.firma.management.service;

import com.firma.management.controller.MatchKandidatController;
import com.firma.management.dto.MatchKandidatResponse;
import com.firma.management.dto.MatchKandidatResult;
import com.firma.management.entity.*;
import jakarta.annotation.Nonnull;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.*;

@Service
public class MatchKandidatService {

    private static final String KRITERIEN_EXPLAINED =
            "Bewertung basiert auf bis zu 6 Kriterien (Fachlicher Skill, Gehalt, Zertifikate, Deutsch, Englisch, " +
            "Sonstige Sprachen). Als KO-Kriterium markierte Felder schließen nicht passende Kandidaten von der " +
            "Trefferliste aus. Alle im Suchauftrag angegebenen Kriterien fließen in den Score ein (1 Punkt je " +
            "erfülltes Kriterium).";

    private final DataSource dataSource;
    private final SuchauftragService suchauftragService;

    public MatchKandidatService(DataSource dataSource, SuchauftragService suchauftragService) {
        this.dataSource = dataSource;
        this.suchauftragService = suchauftragService;
    }


    public MatchKandidatResponse matchKandidat(MatchKandidatController.MatchKandidatRequest matchKandidatRequest) {

        Optional<Suchauftrag> suchauftrag = suchauftragService.getById(matchKandidatRequest.suchauftragId());

        List<Kandidat> kandidaten = getKandidatsExcludingKOKriterien(suchauftrag, matchKandidatRequest);

        List<Kriterium> kriterien = suchauftrag.map(this::buildKriterien).orElseGet(List::of);

        List<MatchKandidatResult> results = kandidaten.stream()
                .map(k -> scoreKandidat(k, kriterien))
                .sorted(Comparator.comparing(MatchKandidatResult::getScore).reversed())
                .toList();

        return new MatchKandidatResponse(KRITERIEN_EXPLAINED, kriterien.size(), results);
    }


    @Nonnull
    private List<Kandidat> getKandidatsExcludingKOKriterien(Optional<Suchauftrag> suchauftrag, MatchKandidatController.MatchKandidatRequest matchKandidatRequest) {
        List<String> clauses = new ArrayList<>(); // SQL condition fragments with `?` placeholders, joined with AND
        List<Object> params = new ArrayList<>(); // values bound to those placeholders, in matching order

        if (suchauftrag.isPresent()) {
            if (suchauftrag.get().isFachlicherSkillKOKriterium()) {
                appendFachlicherSkill(Arrays.stream(suchauftrag.get().getFachlicherSkill().split(",")).toList(), clauses, params);
            }
            if (suchauftrag.get().isGehaltKOKriterium()) {
                appendGehalt(suchauftrag, clauses, params);
            }
            if (suchauftrag.get().isZertifikateKOKriterium()){
                appendZertifikate(Arrays.stream(suchauftrag.get().getZertifikate().split(",")).toList(), clauses, params);
            }
            if (suchauftrag.get().isDeutschKOKriterium()) {
                appendDeutsch(suchauftrag, clauses, params);
            }
            if (suchauftrag.get().isEnglischKOKriterium()) {
                appendEnglisch(suchauftrag, clauses, params);
            }
            if (suchauftrag.get().isSonstigeSprachenKOKriterium()) {
                appendSonstigeSprachen(Arrays.stream(suchauftrag.get().getSonstigeSprachen().split(",")).toList(), clauses, params);
            }
        }

        String whereClause = clauses.isEmpty() ? "1=1" : String.join(" AND ", clauses);
        String sql = "SELECT * FROM kandidat WHERE " + whereClause;

        List<Kandidat> result = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    result.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to query kandidat. Querry:" + sql,  e);
        }
        return result;
    }

    private static void appendGehalt(Optional<Suchauftrag> suchauftrag, List<String> clauses, List<Object> params) {
        clauses.add("gehalt_minimum <= ?");
        params.add(suchauftrag.get().getGehaltMaximum());
    }

    private void appendFachlicherSkill(List<String> skills, List<String> clauses, List<Object> params) {
        appendAllTermsMatch("fachlicher_skill", skills, clauses, params);
    }

    private void appendZertifikate(List<String> zeritifikate, List<String> clauses, List<Object> params) {
        appendAllTermsMatch("zertifikate", zeritifikate, clauses, params);
    }

    private void appendSonstigeSprachen(List<String> sonstigeSprachen, List<String> clauses, List<Object> params){
        appendAllTermsMatch("zertifikate", sonstigeSprachen, clauses, params);
    }

    private static void appendDeutsch(Optional<Suchauftrag> suchauftrag, List<String> clauses, List<Object> params) {
        appendMindestSprachniveau("deutsch", suchauftrag.get().getDeutsch(), clauses, params);
    }

    private static void appendEnglisch(Optional<Suchauftrag> suchauftrag, List<String> clauses, List<Object> params) {
        appendMindestSprachniveau("englisch", suchauftrag.get().getEnglisch(), clauses, params);
    }

    private static void appendAllTermsMatch(String column, List<String> values, List<String> clauses, List<Object> params) {
        List<String> terms = values.stream()
                .filter(s -> s != null && !s.isBlank())
                .toList();

        if (terms.isEmpty()) {
            return;
        }

        List<String> termClauses = new ArrayList<>();
        for (String term : terms) {
            termClauses.add("LOWER(" + column + ") LIKE ?");
            params.add("%" + term.trim().toLowerCase() + "%");
        }
        clauses.add("( " + String.join(" AND ", termClauses) + " )");
    }

    private static void appendMindestSprachniveau(String column, Sprachniveau minimum, List<String> clauses, List<Object> params) {
        List<String> acceptableLevel = new ArrayList<>();
        for (Sprachniveau level : Sprachniveau.values()) {
            if (level.ordinal() >= minimum.ordinal()) {
                acceptableLevel.add("?");
                params.add(level.name());
            }
        }
        clauses.add(column + " IN (" + String.join(", ", acceptableLevel) + ")");
    }

    /** A single, applicable scoring criterion derived from a Suchauftrag. */
    private record Kriterium(String label, java.util.function.Predicate<Kandidat> isSatisfied) {}

    private List<Kriterium> buildKriterien(Suchauftrag s) {
        List<Kriterium> kriterien = new ArrayList<>();

        if (!s.isFachlicherSkillKOKriterium() && isNotBlank(s.getFachlicherSkill())) {
            addPerTermKriterien(kriterien, "Fachlicher Skill", s.getFachlicherSkill(), Kandidat::getFachlicherSkill);
        }
        if (!s.isGehaltKOKriterium() && s.getGehaltMaximum() != null) {
            kriterien.add(new Kriterium("Gehalt",
                    k -> k.getGehaltMinimum() != null && k.getGehaltMinimum().compareTo(s.getGehaltMaximum()) <= 0));
        }
        if (!s.isZertifikateKOKriterium() && isNotBlank(s.getZertifikate())) {
            addPerTermKriterien(kriterien, "Zertifikate", s.getZertifikate(), Kandidat::getZertifikate);
        }
        if (!s.isDeutschKOKriterium() && s.getDeutsch() != null) {
            kriterien.add(new Kriterium("Deutsch",
                    k -> k.getDeutsch() != null && k.getDeutsch().ordinal() >= s.getDeutsch().ordinal()));
        }
        if (!s.isEnglischKOKriterium() && s.getEnglisch() != null) {
            kriterien.add(new Kriterium("Englisch",
                    k -> k.getEnglisch() != null && k.getEnglisch().ordinal() >= s.getEnglisch().ordinal()));
        }
        if (!s.isSonstigeSprachenKOKriterium() && isNotBlank(s.getSonstigeSprachen())) {
            addPerTermKriterien(kriterien, "Sonstige Sprachen", s.getSonstigeSprachen(), Kandidat::getSonstigeSprachen);
        }
        return kriterien;
    }

    private static void addPerTermKriterien(List<Kriterium> kriterien, String label, String requiredTerms,
                                             java.util.function.Function<Kandidat, String> actualValue) {
        for (String rawTerm : requiredTerms.split(",")) {
            String term = rawTerm.trim();
            if (!term.isEmpty()) {
                kriterien.add(new Kriterium(label + ": " + term,
                        k -> matchesTerm(term, actualValue.apply(k))));
            }
        }
    }

    private MatchKandidatResult scoreKandidat(Kandidat kandidat, List<Kriterium> kriterien) {
        List<String> satisfied = new ArrayList<>();
        List<String> unsatisfied = new ArrayList<>();
        for (Kriterium kriterium : kriterien) {
            if (kriterium.isSatisfied().test(kandidat)) {
                satisfied.add(kriterium.label());
            } else {
                unsatisfied.add(kriterium.label());
            }
        }
        return new MatchKandidatResult(kandidat, satisfied.size(), String.join(", ", satisfied), String.join(", ", unsatisfied));
    }

    private static boolean matchesTerm(String term, String actual) {
        return actual != null && actual.toLowerCase().contains(term.toLowerCase());
    }

    private static boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }

    private Kandidat mapRow(ResultSet rs) throws SQLException {
        return Kandidat.builder()
                .id(rs.getObject("id", UUID.class))
                .dsgvoBestaetigungsDatum(rs.getObject("dsgvo_bestaetigungs_datum", LocalDate.class))
                .geschlecht(toEnum(Geschlecht.class, rs.getString("geschlecht")))
                .titel(toEnum(Titel.class, rs.getString("titel")))
                .vorname(rs.getString("vorname"))
                .nachname(rs.getString("nachname"))
                .postleitzahl(rs.getObject("postleitzahl", Integer.class))
                .ort(rs.getString("ort"))
                .geburtsjahr(rs.getObject("geburtsjahr", Integer.class))
                .staatsangehoerigkeit(rs.getString("staatsangehoerigkeit"))
                .familienstand(rs.getString("familienstand"))
                .kinder(rs.getString("kinder"))
                .wochenstunden(rs.getString("wochenstunden"))
                .wochenendbereitschaft(rs.getString("wochenendbereitschaft"))
                .homeoffice(rs.getString("homeoffice"))
                .firmenwagenregelung(rs.getString("firmenwagenregelung"))
                .reisetaetigkeitenMitUebernachtung(rs.getString("reisetaetigkeiten_mit_uebernachtung"))
                .deutsch(toEnum(Sprachniveau.class, rs.getString("deutsch")))
                .englisch(toEnum(Sprachniveau.class, rs.getString("englisch")))
                .sonstigeSprachen(rs.getString("sonstige_sprachen"))
                .hochschulabschluss(rs.getString("hochschulabschluss"))
                .berufsausbildung(rs.getString("berufsausbildung"))
                .autofuehrerschein(toEnum(Fuehrerschein.class, rs.getString("autofuehrerschein")))
                .zertifikate(rs.getString("zertifikate"))
                .taeglicheFahrzeit(rs.getObject("taegliche_fahrzeit", Integer.class))
                .branchenkenntnisse(rs.getString("branchenkenntnisse"))
                .aktuelleTaetigkeiten(rs.getString("aktuelle_taetigkeiten"))
                .aktuellePosition(rs.getString("aktuelle_position"))
                .wechselgruende(rs.getString("wechselgruende"))
                .zukuenftigePositionTaetigkeiten(rs.getString("zukuenftige_position_taetigkeiten"))
                .kuendigungsfrist(rs.getString("kuendigungsfrist"))
                .erstesOnlineMeeting(rs.getString("erstes_online_meeting"))
                .allgemeinerSchwerpunkt(toEnum(AllgemeinerSchwerpunkt.class, rs.getString("allgemeiner_schwerpunkt")))
                .fachlicherSkill(rs.getString("fachlicher_skill"))
                .firmenSelbevorben(rs.getString("firmen_selbevorben"))
                .firmenNogo(rs.getString("firmen_nogo"))
                .email(rs.getString("email"))
                .telefon(rs.getString("telefon"))
                .linkedinProfil(rs.getString("linkedin_profil"))
                .xingProfil(rs.getString("xing_profil"))
                .gehaltMinimum(rs.getBigDecimal("gehalt_minimum"))
                .gehaltMaximum(rs.getBigDecimal("gehalt_maximum"))
                .build();
    }

    private static <E extends Enum<E>> E toEnum(Class<E> type, String value) {
        return value == null ? null : Enum.valueOf(type, value);
    }
}
