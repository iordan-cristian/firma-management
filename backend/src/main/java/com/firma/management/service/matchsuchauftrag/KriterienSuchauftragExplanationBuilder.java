package com.firma.management.service.matchsuchauftrag;

import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Suchauftrag;
import com.firma.management.service.matching.Kriterium;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Reverse of {@code KriterienKandidatExplanationBuilder}: a human-readable summary of which KO
 * criteria of the Kandidat filter the Suchauftrag hit list, plus which soft criteria are scored.
 */
@Component
class KriterienSuchauftragExplanationBuilder {

    String explain(Kandidat k, List<Kriterium<Suchauftrag>> kriterien) {
        List<String> koKriterien = new ArrayList<>();
        if (k.isAllgemeinerSchwerpunktKOKriterium() && k.getAllgemeinerSchwerpunkt() != null) {
            koKriterien.add("- Allgemeiner Schwerpunkt: " + k.getAllgemeinerSchwerpunkt().getLabel());
        }
        if (k.isFachlicherSkillKOKriterium() && isNotBlank(k.getFachlicherSkill())) {
            koKriterien.add("- Fachlicher Skill enthält: " + k.getFachlicherSkill());
        } else if (k.isFachlicherSkillMindestensEin() && isNotBlank(k.getFachlicherSkill())) {
            koKriterien.add("- Fachlicher Skill enthält mindestens ein: " + k.getFachlicherSkill());
        }
        if (k.isGehaltKOKriterium() && k.getGehaltMinimum() != null) {
            koKriterien.add("- Gehalt Angebot >= " + k.getGehaltMinimum());
        }
        if (k.isBerufserfahrungKOKriterium() && k.getBerufserfahrung() != null) {
            koKriterien.add("- Berufserfahrung maximal: " + k.getBerufserfahrung() + " Jahre");
        }
        if (k.isBranchenkenntnisseKOKriterium() && isNotBlank(k.getBranchenkenntnisse())) {
            koKriterien.add("- Branchenkenntnisse enthält: " + k.getBranchenkenntnisse());
        } else if (k.isBranchenkenntnisseMindestensEin() && isNotBlank(k.getBranchenkenntnisse())) {
            koKriterien.add("- Branchenkenntnisse enthält mindestens ein: " + k.getBranchenkenntnisse());
        }
        if (k.isZertifikateKOKriterium() && isNotBlank(k.getZertifikate())) {
            koKriterien.add("- Zertifikate enthält: " + k.getZertifikate());
        } else if (k.isZertifikateMindestensEin() && isNotBlank(k.getZertifikate())) {
            koKriterien.add("- Zertifikate enthält mindestens ein: " + k.getZertifikate());
        }
        if (k.isDeutschKOKriterium() && k.getDeutsch() != null) {
            koKriterien.add("- Deutsch Niveau maximal: " + k.getDeutsch().getLabel());
        }
        if (k.isEnglischKOKriterium() && k.getEnglisch() != null) {
            koKriterien.add("- Englisch Niveau maximal: " + k.getEnglisch().getLabel());
        }
        if (k.isSonstigeSprachenKOKriterium() && isNotBlank(k.getSonstigeSprachen())) {
            koKriterien.add("- Sonstige Sprachen enthält: " + k.getSonstigeSprachen());
        }

        List<String> scoreKriterien = kriterien.stream().map(Kriterium::label).toList();

        return "Suchaufträge die folgende KO-Kriterien des Kandidaten einhalten sind in der Trefferliste enthalten: \n"
                + (koKriterien.isEmpty() ? "keine" : String.join(", \n", koKriterien)) + "."
                + "\n \n" + "Suchauftrag wird für folgende Score-Kriterien (1 Punkt je erfülltes Kriterium) bewertet: \n"
                + (scoreKriterien.isEmpty() ? "keine" : String.join(", \n", scoreKriterien))
                + ".";
    }

    private static boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }
}
