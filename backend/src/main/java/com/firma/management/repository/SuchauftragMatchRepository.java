package com.firma.management.repository;

import com.firma.management.entity.Aktivitaet;
import com.firma.management.entity.AllgemeinerSchwerpunkt;
import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Sprachniveau;
import com.firma.management.entity.Status;
import com.firma.management.entity.Suchauftrag;
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

/**
 * Reverse of {@link KandidatMatchRepository}: loads the open Suchaufträge that pass every KO
 * criterion configured on the given Kandidat. Soft/scoring criteria are applied later, in memory,
 * by {@code KriterienScorer}.
 */
@Repository
public class SuchauftragMatchRepository {

    private final DataSource dataSource;

    public SuchauftragMatchRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<Suchauftrag> findExcludingKoKriterien(Kandidat k) {
        WhereClause where = new WhereClause();
        where.eq("status", Status.IN_ARBEIT.name());

        if (k.isAllgemeinerSchwerpunktKOKriterium() && k.getAllgemeinerSchwerpunkt() != null) {
            where.eq("allgemeiner_schwerpunkt", k.getAllgemeinerSchwerpunkt().name());
        }
        if (k.isFachlicherSkillKOKriterium() && isNotBlank(k.getFachlicherSkill())) {
            where.allTermsMatch("fachlicher_skill", k.getFachlicherSkill());
        } else if (k.isFachlicherSkillMindestensEin() && isNotBlank(k.getFachlicherSkill())) {
            where.atLeastOneTermMatches("fachlicher_skill", k.getFachlicherSkill());
        }
        if (k.isGehaltKOKriterium() && k.getGehaltMinimum() != null) {
            where.atLeast("gehalt_maximum", k.getGehaltMinimum());
        }
        if (k.isZertifikateKOKriterium() && isNotBlank(k.getZertifikate())) {
            where.allTermsMatch("zertifikate", k.getZertifikate());
        } else if (k.isZertifikateMindestensEin() && isNotBlank(k.getZertifikate())) {
            where.atLeastOneTermMatches("zertifikate", k.getZertifikate());
        }
        if (k.isBerufserfahrungKOKriterium() && k.getBerufserfahrung() != null) {
            where.atMost("berufserfahrung", k.getBerufserfahrung());
        }
        if (k.isBranchenkenntnisseKOKriterium() && isNotBlank(k.getBranchenkenntnisse())) {
            where.allTermsMatch("branchenkenntnisse", k.getBranchenkenntnisse());
        } else if (k.isBranchenkenntnisseMindestensEin() && isNotBlank(k.getBranchenkenntnisse())) {
            where.atLeastOneTermMatches("branchenkenntnisse", k.getBranchenkenntnisse());
        }
        if (k.isDeutschKOKriterium() && k.getDeutsch() != null) {
            where.maxSprachniveau("deutsch", k.getDeutsch());
        }
        if (k.isEnglischKOKriterium() && k.getEnglisch() != null) {
            where.maxSprachniveau("englisch", k.getEnglisch());
        }
        if (k.isSonstigeSprachenKOKriterium() && isNotBlank(k.getSonstigeSprachen())) {
            where.allTermsMatch("sonstige_sprachen", k.getSonstigeSprachen());
        }

        return query(where);
    }

    private List<Suchauftrag> query(WhereClause where) {
        String sql = "SELECT * FROM suchauftrag WHERE " + where.whereSql();

        List<Suchauftrag> result = new ArrayList<>();
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
            throw new RuntimeException("Failed to query suchauftrag. Query: " + sql, e);
        }
        return result;
    }

    private static boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }

    private Suchauftrag mapRow(ResultSet rs) throws SQLException {
        return Suchauftrag.builder()
                .id(rs.getObject("id", UUID.class))
                .ansprechpartnerId(rs.getObject("ansprechpartner_id", UUID.class))
                .aktivitaet(toEnum(Aktivitaet.class, rs.getString("aktivitaet")))
                .ort(rs.getString("ort"))
                .postleitzahl(rs.getString("postleitzahl"))
                .adresse(rs.getString("adresse"))
                .allgemeinerSchwerpunkt(toEnum(AllgemeinerSchwerpunkt.class, rs.getString("allgemeiner_schwerpunkt")))
                .allgemeinerSchwerpunktKOKriterium(rs.getBoolean("allgemeiner_schwerpunkt_ko_kriterium"))
                .fachlicherSkill(rs.getString("fachlicher_skill"))
                .fachlicherSkillKOKriterium(rs.getBoolean("fachlicher_skill_ko_kriterium"))
                .fachlicherSkillMindestensEin(rs.getBoolean("fachlicher_skill_mindestens_ein"))
                .optionalFachlicheSkills(rs.getString("optionale_fachliche_skills"))
                .gehaltMehrInfo(rs.getString("gehalt_mehr_info"))
                .gehaltKOKriterium(rs.getBoolean("gehalt_ko_kriterium"))
                .berufserfahrung(rs.getObject("berufserfahrung", Integer.class))
                .berufserfahrungKOKriterium(rs.getBoolean("berufserfahrung_ko_kriterium"))
                .branchenkenntnisse(rs.getString("branchenkenntnisse"))
                .branchenkenntnisseKOKriterium(rs.getBoolean("branchenkenntnisse_ko_kriterium"))
                .branchenkenntnisseMindestensEin(rs.getBoolean("branchenkenntnisse_mindestens_ein"))
                .optionalBranchenkenntnisse(rs.getString("optionale_branchenkenntnisse"))
                .zertifikate(rs.getString("zertifikate"))
                .zertifikateKOKriterium(rs.getBoolean("zertifikate_ko_kriterium"))
                .zertifikateMindestensEin(rs.getBoolean("zertifikate_mindestens_ein"))
                .optionalZertifikate(rs.getString("optionale_zertifikate"))
                .deutsch(toEnum(Sprachniveau.class, rs.getString("deutsch")))
                .deutschKOKriterium(rs.getBoolean("deutsch_ko_kriterium"))
                .englisch(toEnum(Sprachniveau.class, rs.getString("englisch")))
                .englischKOKriterium(rs.getBoolean("englisch_ko_kriterium"))
                .sonstigeSprachen(rs.getString("sonstige_sprachen"))
                .sonstigeSprachenKOKriterium(rs.getBoolean("sonstige_sprachen_ko_kriterium"))
                .informationen(rs.getString("informationen"))
                .status(toEnum(Status.class, rs.getString("status")))
                .anlageDatum(rs.getObject("anlage_datum", LocalDate.class))
                .gehaltMinimum(rs.getBigDecimal("gehalt_minimum"))
                .gehaltMaximum(rs.getBigDecimal("gehalt_maximum"))
                .build();
    }

    private static <E extends Enum<E>> E toEnum(Class<E> type, String value) {
        return value == null ? null : Enum.valueOf(type, value);
    }
}
