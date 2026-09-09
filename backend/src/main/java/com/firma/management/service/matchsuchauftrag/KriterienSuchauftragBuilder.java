package com.firma.management.service.matchsuchauftrag;

import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Suchauftrag;
import com.firma.management.service.matching.Kriterium;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

/**
 * Reverse of {@code KriterienKandidatBuilder}: builds the in-memory soft-scoring criteria (one point
 * each) for a Kandidat — one {@link Kriterium} per dimension whose KO flag is <em>off</em> and whose
 * candidate value is present. Each predicate is evaluated against a {@link Suchauftrag}.
 */
@Component
class KriterienSuchauftragBuilder {

    List<Kriterium<Suchauftrag>> build(Kandidat k) {
        List<Kriterium<Suchauftrag>> kriterien = new ArrayList<>();

        if (!k.isAllgemeinerSchwerpunktKOKriterium() && k.getAllgemeinerSchwerpunkt() != null) {
            kriterien.add(new Kriterium<>("- Allgemeiner Schwerpunkt: " + k.getAllgemeinerSchwerpunkt().getLabel(),
                    sa -> sa.getAllgemeinerSchwerpunkt() == k.getAllgemeinerSchwerpunkt()));
        }
        if (!k.isFachlicherSkillKOKriterium() && isNotBlank(k.getFachlicherSkill())) {
            addPerTermKriterien(kriterien, "- Fachlicher Skill", k.getFachlicherSkill(), Suchauftrag::getFachlicherSkill);
        }
        if (!k.isGehaltKOKriterium() && k.getGehaltMinimum() != null) {
            kriterien.add(new Kriterium<>("- Gehalt Angebot >= " + k.getGehaltMinimum(),
                    sa -> sa.getGehaltMaximum() != null && sa.getGehaltMaximum().compareTo(k.getGehaltMinimum()) >= 0));
        }
        if (!k.isBerufserfahrungKOKriterium() && k.getBerufserfahrung() != null) {
            kriterien.add(new Kriterium<>("- Berufserfahrung <= " + k.getBerufserfahrung() + " Jahre",
                    sa -> sa.getBerufserfahrung() != null && sa.getBerufserfahrung() <= k.getBerufserfahrung()));
        }
        if (!k.isBranchenkenntnisseKOKriterium() && isNotBlank(k.getBranchenkenntnisse())) {
            addPerTermKriterien(kriterien, "- Branchenkenntnisse", k.getBranchenkenntnisse(), Suchauftrag::getBranchenkenntnisse);
        }
        if (!k.isZertifikateKOKriterium() && isNotBlank(k.getZertifikate())) {
            addPerTermKriterien(kriterien, "- Zertifikate", k.getZertifikate(), Suchauftrag::getZertifikate);
        }
        if (!k.isDeutschKOKriterium() && k.getDeutsch() != null) {
            kriterien.add(new Kriterium<>("- Deutsch " + k.getDeutsch().getLabel(),
                    sa -> sa.getDeutsch() != null && sa.getDeutsch().ordinal() <= k.getDeutsch().ordinal()));
        }
        if (!k.isEnglischKOKriterium() && k.getEnglisch() != null) {
            kriterien.add(new Kriterium<>("- Englisch " + k.getEnglisch().getLabel(),
                    sa -> sa.getEnglisch() != null && sa.getEnglisch().ordinal() <= k.getEnglisch().ordinal()));
        }
        if (!k.isSonstigeSprachenKOKriterium() && isNotBlank(k.getSonstigeSprachen())) {
            addPerTermKriterien(kriterien, "- Sonstige Sprachen", k.getSonstigeSprachen(), Suchauftrag::getSonstigeSprachen);
        }
        return kriterien;
    }

    private static void addPerTermKriterien(List<Kriterium<Suchauftrag>> kriterien, String label, String requiredTerms,
                                            Function<Suchauftrag, String> actualValue) {
        for (String rawTerm : requiredTerms.split(",")) {
            String term = rawTerm.trim();
            if (!term.isEmpty()) {
                kriterien.add(new Kriterium<>(label + ": " + term,
                        sa -> matchesTerm(term, actualValue.apply(sa))));
            }
        }
    }

    private static boolean matchesTerm(String term, String actual) {
        return actual != null && actual.toLowerCase().contains(term.toLowerCase());
    }

    private static boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }
}
