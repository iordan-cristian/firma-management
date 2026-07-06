package com.firma.management.service;

import com.firma.management.entity.AllgemeinerSchwerpunkt;
import com.firma.management.entity.Fuehrerschein;
import com.firma.management.entity.Geschlecht;
import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Sprachniveau;
import com.firma.management.entity.Titel;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MatchKandidatService {

    private final DataSource dataSource;

    public MatchKandidatService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<Kandidat> findByFachlicherSkills(List<String> skills) {
        List<String> terms = skills.stream()
                .filter(s -> s != null && !s.isBlank())
                .toList();
        if (terms.isEmpty()) {
            return List.of();
        }

        String whereClause = terms.stream()
                .map(t -> "LOWER(fachlicher_skill) LIKE ?")
                .collect(Collectors.joining(" OR "));
        String sql = "SELECT * FROM kandidat WHERE " + whereClause;

        List<Kandidat> result = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            for (int i = 0; i < terms.size(); i++) {
                stmt.setString(i + 1, "%" + terms.get(i).toLowerCase() + "%");
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    result.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to query kandidat by fachlicher_skill", e);
        }
        return result;
    }

    /**
     * @param skills    the fachlicher_skill search terms
     * @param operators operators joining consecutive skills, must contain exactly
     *                  {@code skills.size() - 1} elements, each either "AND" or "OR"
     */
    public List<Kandidat> findByFachlicherSkills(List<String> skills, List<String> operators) {
        List<String> terms = skills.stream()
                .filter(s -> s != null && !s.isBlank())
                .toList();
        if (terms.isEmpty()) {
            return List.of();
        }
        if (operators == null || operators.size() != terms.size() - 1) {
            throw new IllegalArgumentException(
                    "operators must contain exactly skills.size() - 1 elements (\"AND\" or \"OR\" between each pair of skills)");
        }
        for (String operator : operators) {
            if (!"AND".equalsIgnoreCase(operator) && !"OR".equalsIgnoreCase(operator)) {
                throw new IllegalArgumentException("Each operator must be \"AND\" or \"OR\", got: " + operator);
            }
        }

        StringBuilder whereClause = new StringBuilder("LOWER(fachlicher_skill) LIKE ?");
        for (String operator : operators) {
            whereClause.append(' ').append(operator.toUpperCase()).append(" LOWER(fachlicher_skill) LIKE ?");
        }
        String sql = "SELECT * FROM kandidat WHERE " + whereClause;

        List<Kandidat> result = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            for (int i = 0; i < terms.size(); i++) {
                stmt.setString(i + 1, "%" + terms.get(i).toLowerCase() + "%");
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    result.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to query kandidat by fachlicher_skill", e);
        }
        return result;
    }

    public List<Kandidat> findByGehaltMinimumLessThanEqual(Integer maxGehaltMinimum) {
        String sql = "SELECT * FROM kandidat WHERE gehalt_minimum <= ?";

        List<Kandidat> result = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, maxGehaltMinimum);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    result.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to query kandidat by gehalt_minimum", e);
        }
        return result;
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
