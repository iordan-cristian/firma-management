package com.firma.management.controller;

import com.firma.management.entity.Kandidat;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

public class MatchKandidatController {

    @GetMapping
    public List<Kandidat> getAll() {
        return service.getAll();
    }
}
