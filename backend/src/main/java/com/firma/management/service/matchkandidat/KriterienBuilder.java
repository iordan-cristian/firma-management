package com.firma.management.service.matchkandidat;

import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Suchauftrag;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

@Component
class KriterienBuilder {

    List<KriteriumKandidat> build(Suchauftrag s) {
        List<KriteriumKandidat> kriterien = new ArrayList<>();

        if (!s.isAllgemeinerSchwerpunktKOKriterium() && s.getAllgemeinerSchwerpunkt() != null) {
            kriterien.add(new KriteriumKandidat("- Allgemeiner Schwerpunkt: " + s.getAllgemeinerSchwerpunkt().getLabel(),
                    k -> k.getAllgemeinerSchwerpunkt() == s.getAllgemeinerSchwerpunkt()));
        }
        if (!s.isFachlicherSkillKOKriterium() && isNotBlank(s.getFachlicherSkill())) {
            addPerTermKriterien(kriterien, "- Fachlicher Skill", s.getFachlicherSkill(), Kandidat::getFachlicherSkill);
        } else if (s.isFachlicherSkillKOKriterium() && isNotBlank(s.getOptionalFachlicheSkills())) {
            addPerTermKriterien(kriterien, "- Fachlicher Skill", s.getOptionalFachlicheSkills(), Kandidat::getFachlicherSkill);
        }
        if (!s.isGehaltKOKriterium() && s.getGehaltMaximum() != null) {

            kriterien.add(new KriteriumKandidat("- Gehalt Erwartung <= " + s.getGehaltMaximum(),
                    k -> k.getGehaltMinimum() != null && k.getGehaltMinimum().compareTo(s.getGehaltMaximum()) <= 0));
        }
        if (!s.isBerufserfahrungKOKriterium() && s.getBerufserfahrung() != null) {
            kriterien.add(new KriteriumKandidat("- Berufserfahrung >= " + s.getBerufserfahrung() + " Jahre",
                    k -> k.getBerufserfahrung() != null && k.getBerufserfahrung() >= s.getBerufserfahrung()));
        }
        if (!s.isBranchenkenntnisseKOKriterium() && isNotBlank(s.getBranchenkenntnisse())) {
            addPerTermKriterien(kriterien, "- Branchenkenntnisse", s.getBranchenkenntnisse(), Kandidat::getBranchenkenntnisse);
        } else if (s.isBranchenkenntnisseKOKriterium() && isNotBlank(s.getOptionalBranchenkenntnisse())) {
            addPerTermKriterien(kriterien, "- Branchenkenntnisse", s.getOptionalBranchenkenntnisse(), Kandidat::getBranchenkenntnisse);
        }
        if (!s.isZertifikateKOKriterium() && isNotBlank(s.getZertifikate())) {
            addPerTermKriterien(kriterien, "- Zertifikate", s.getZertifikate(), Kandidat::getZertifikate);
        } else if (s.isZertifikateKOKriterium() && isNotBlank(s.getOptionalZertifikate())) {
            addPerTermKriterien(kriterien, "- Zertifikate", s.getOptionalZertifikate(), Kandidat::getZertifikate);
        }
        if (!s.isDeutschKOKriterium() && s.getDeutsch() != null) {
            kriterien.add(new KriteriumKandidat("- Deutsch " + s.getDeutsch().getLabel(),
                    k -> k.getDeutsch() != null && k.getDeutsch().ordinal() >= s.getDeutsch().ordinal()));
        }
        if (!s.isEnglischKOKriterium() && s.getEnglisch() != null) {
            kriterien.add(new KriteriumKandidat("- Englisch " + s.getEnglisch().getLabel(),
                    k -> k.getEnglisch() != null && k.getEnglisch().ordinal() >= s.getEnglisch().ordinal()));
        }
        if (!s.isSonstigeSprachenKOKriterium() && isNotBlank(s.getSonstigeSprachen())) {
            addPerTermKriterien(kriterien, "- Sonstige Sprachen", s.getSonstigeSprachen(), Kandidat::getSonstigeSprachen);
        }
        return kriterien;
    }

    private static void addPerTermKriterien(List<KriteriumKandidat> kriterien, String label, String requiredTerms,
                                            Function<Kandidat, String> actualValue) {
        for (String rawTerm : requiredTerms.split(",")) {
            String term = rawTerm.trim();
            if (!term.isEmpty()) {
                kriterien.add(new KriteriumKandidat(label + ": " + term,
                        k -> matchesTerm(term, actualValue.apply(k))));
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
