package com.firma.management.repository;

import com.firma.management.entity.AllgemeinerSchwerpunkt;
import com.firma.management.entity.Fuehrerschein;
import com.firma.management.entity.Geschlecht;
import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Sprachniveau;
import com.firma.management.entity.Suchauftrag;
import com.firma.management.entity.Titel;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class KandidatMatchRepository {

    private final DataSource dataSource;

    public KandidatMatchRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Loads the candidates that pass every KO criterion configured on the Suchauftrag. Each active
     * KO criterion (or its "mindestens ein" variant) contributes one SQL condition; candidates must
     * satisfy all of them. Soft/scoring criteria are applied later, in memory, by {@code KriterienScorer}.
     */
    public List<Kandidat> findExcludingKoKriterien(Suchauftrag s) {
        WhereClause where = new WhereClause();

        if (s.isAllgemeinerSchwerpunktKOKriterium() && s.getAllgemeinerSchwerpunkt() != null) {
            where.eq("allgemeiner_schwerpunkt", s.getAllgemeinerSchwerpunkt().name());
        }
        if (s.isFachlicherSkillKOKriterium() && isNotBlank(s.getFachlicherSkill())) {
            where.allTermsMatch("fachlicher_skill", s.getFachlicherSkill());
        } else if (s.isFachlicherSkillMindestensEin() && isNotBlank(s.getFachlicherSkill())) {
            where.atLeastOneTermMatches("fachlicher_skill", s.getFachlicherSkill());
        }
        if (s.isGehaltKOKriterium() && s.getGehaltMaximum() != null) {
            where.atMost("gehalt_minimum", s.getGehaltMaximum());
        }
        if (s.isZertifikateKOKriterium() && isNotBlank(s.getZertifikate())) {
            where.allTermsMatch("zertifikate", s.getZertifikate());
        } else if (s.isZertifikateMindestensEin() && isNotBlank(s.getZertifikate())) {
            where.atLeastOneTermMatches("zertifikate", s.getZertifikate());
        }
        if (s.isBerufserfahrungKOKriterium() && s.getBerufserfahrung() != null) {
            where.atLeast("berufserfahrung", s.getBerufserfahrung());
        }
        if (s.isBranchenkenntnisseKOKriterium() && isNotBlank(s.getBranchenkenntnisse())) {
            where.allTermsMatch("branchenkenntnisse", s.getBranchenkenntnisse());
        } else if (s.isBranchenkenntnisseMindestensEin() && isNotBlank(s.getBranchenkenntnisse())) {
            where.atLeastOneTermMatches("branchenkenntnisse", s.getBranchenkenntnisse());
        }
        if (s.isDeutschKOKriterium() && s.getDeutsch() != null) {
            where.minSprachniveau("deutsch", s.getDeutsch());
        }
        if (s.isEnglischKOKriterium() && s.getEnglisch() != null) {
            where.minSprachniveau("englisch", s.getEnglisch());
        }
        if (s.isSonstigeSprachenKOKriterium() && isNotBlank(s.getSonstigeSprachen())) {
            where.allTermsMatch("sonstige_sprachen", s.getSonstigeSprachen());
        }

        return query(where);
    }

    private List<Kandidat> query(WhereClause where) {
        String sql = "SELECT * FROM kandidat WHERE " + where.whereSql();

        List<Kandidat> result = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            List<Object> params = where.params();
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    result.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to query kandidat. Query: " + sql, e);
        }
        return result;
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
                .berufserfahrung(rs.getObject("berufserfahrung", Integer.class))
                .aktuelleTaetigkeiten(rs.getString("aktuelle_taetigkeiten"))
                .aktuellePosition(rs.getString("aktuelle_position"))
                .aktuelleFirma(rs.getString("aktuelle_firma"))
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
                .allgemeinerSchwerpunktKOKriterium(rs.getBoolean("allgemeiner_schwerpunkt_ko_kriterium"))
                .fachlicherSkillKOKriterium(rs.getBoolean("fachlicher_skill_ko_kriterium"))
                .fachlicherSkillMindestensEin(rs.getBoolean("fachlicher_skill_mindestens_ein"))
                .gehaltKOKriterium(rs.getBoolean("gehalt_ko_kriterium"))
                .berufserfahrungKOKriterium(rs.getBoolean("berufserfahrung_ko_kriterium"))
                .branchenkenntnisseKOKriterium(rs.getBoolean("branchenkenntnisse_ko_kriterium"))
                .branchenkenntnisseMindestensEin(rs.getBoolean("branchenkenntnisse_mindestens_ein"))
                .zertifikateKOKriterium(rs.getBoolean("zertifikate_ko_kriterium"))
                .zertifikateMindestensEin(rs.getBoolean("zertifikate_mindestens_ein"))
                .deutschKOKriterium(rs.getBoolean("deutsch_ko_kriterium"))
                .englischKOKriterium(rs.getBoolean("englisch_ko_kriterium"))
                .sonstigeSprachenKOKriterium(rs.getBoolean("sonstige_sprachen_ko_kriterium"))
                .build();
    }

    private static <E extends Enum<E>> E toEnum(Class<E> type, String value) {
        return value == null ? null : Enum.valueOf(type, value);
    }
}
