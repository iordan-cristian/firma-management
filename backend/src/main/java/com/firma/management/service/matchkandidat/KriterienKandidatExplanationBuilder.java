package com.firma.management.service.matchkandidat;

import com.firma.management.entity.Kandidat;
import com.firma.management.entity.Suchauftrag;
import com.firma.management.service.matching.Kriterium;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
class KriterienKandidatExplanationBuilder {

    String explain(Suchauftrag s, List<Kriterium<Kandidat>> kriterien) {
        List<String> koKriterien = new ArrayList<>();
        if (s.isAllgemeinerSchwerpunktKOKriterium()) koKriterien.add("- Allgemeiner Schwerpunkt: " + s.getAllgemeinerSchwerpunkt().getLabel());
        if (s.isFachlicherSkillKOKriterium()) koKriterien.add("- Fachlicher Skill enhält: " + s.getFachlicherSkill());
        else if (s.isFachlicherSkillMindestensEin())
            koKriterien.add("- Fachlicher Skill enhält mindestens ein: " + s.getFachlicherSkill());
        if (s.isGehaltKOKriterium()) koKriterien.add("- Gehalt Erwartung <= " + s.getGehaltMaximum().toString());
        if (s.isBerufserfahrungKOKriterium()) koKriterien.add("- Berufserfahrung mindestens: " + s.getBerufserfahrung() + " Jahre");
        if (s.isBranchenkenntnisseKOKriterium()) koKriterien.add("- Branchenkenntnisse enthält: " + s.getBranchenkenntnisse());
        else if (s.isBranchenkenntnisseMindestensEin())
            koKriterien.add("- Branchenkenntnisse enhält mindestens ein: " + s.getBranchenkenntnisse());
        if (s.isZertifikateKOKriterium()) koKriterien.add("- Zertifikate enhält: " + s.getZertifikate());
        else if (s.isZertifikateMindestensEin())
            koKriterien.add("- Zertifikate enhält mindestens ein: " + s.getZertifikate());
        if (s.isDeutschKOKriterium()) koKriterien.add("- Deutsch Niveau mindestens:" + s.getDeutsch().getLabel());
        if (s.isEnglischKOKriterium()) koKriterien.add("- Englisch Niveau mindestens:" + s.getEnglisch().getLabel());
        if (s.isSonstigeSprachenKOKriterium()) koKriterien.add("- Sonstige Sprachenenhält: " + s.getSonstigeSprachen());

        List<String> scoreKriterien = kriterien.stream().map(Kriterium::label).toList();

        return "Kandidaten die folgende KO-Kriterien einhalten sind in der Trefferliste enthalten: \n"
                + (koKriterien.isEmpty() ? "keine" : String.join(", \n", koKriterien)) + "."
                + "\n \n" + "Kandidat wird für folgende Score-Kriterien (1 Punkt je erfülltes Kriterium) bewertet: \n"
                + (scoreKriterien.isEmpty() ? "keine" : String.join(", \n", scoreKriterien))
                + ".";
    }
}
