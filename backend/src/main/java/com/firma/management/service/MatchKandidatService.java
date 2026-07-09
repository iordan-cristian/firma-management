package com.firma.management.service;

import com.firma.management.controller.MatchKandidatController;
import com.firma.management.entity.*;
import jakarta.annotation.Nonnull;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.*;

@Service
public class MatchKandidatService {

    private final DataSource dataSource;
    private final SuchauftragService suchauftragService;

    public MatchKandidatService(DataSource dataSource, SuchauftragService suchauftragService) {
        this.dataSource = dataSource;
        this.suchauftragService = suchauftragService;
    }


    public List<Kandidat> matchKandidat(MatchKandidatController.MatchKandidatRequest matchKandidatRequest) {

        Optional<Suchauftrag> suchauftrag = suchauftragService.getById(matchKandidatRequest.suchauftragId());


        return getKandidatsExcludingKOKriterien(suchauftrag, matchKandidatRequest);
    }


    @Nonnull
    private List<Kandidat> getKandidatsExcludingKOKriterien(Optional<Suchauftrag> suchauftrag, MatchKandidatController.MatchKandidatRequest matchKandidatRequest) {
        StringBuilder whereClause = new StringBuilder();

        if (suchauftrag.isPresent()) {
            if (matchKandidatRequest.fachlicherSkillKOKriterium()) {
                whereClause.append(whereClauseFachlicherSkill(Arrays.stream(suchauftrag.get().getFachlicherSkill().split(",")).toList()));
            } else if (matchKandidatRequest.gehaltKOKriterium()) {
                if (!whereClause.isEmpty()){
                    whereClause.append(" AND ");
                }
                whereClause.append(whereClauseGehalt(suchauftrag.get().getGehaltMaximum()));
            }
        }

        String sql = "SELECT * FROM kandidat WHERE " + whereClause;

        List<Kandidat> result = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    result.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to query kandidat. Querry" + sql,  e);
        }
        return result;
    }

    private String whereClauseFachlicherSkill(List<String> skills) {
        List<String> terms = skills.stream()
                .filter(s -> s != null && !s.isBlank())
                .toList();

        StringBuilder whereClause = new StringBuilder("( ");
        for (int i = 0; i < terms.size(); i++) {
            if (i > 0) {
                whereClause.append(" AND ");
            }
            whereClause.append("LOWER(fachlicher_skill) LIKE '%" + terms.get(i).toLowerCase() + "%'");
        }
        whereClause.append(" )");
        return whereClause.toString();
    }

    private String whereClauseGehalt(BigDecimal gehaltAngebot) {
        return "( gehalt_minimum <=" + gehaltAngebot + " )";
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
