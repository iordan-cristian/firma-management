package com.firma.management.controller;

import com.firma.management.service.PlzService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/plz")
public class PlzController {

    private final PlzService service;

    public PlzController(PlzService service) {
        this.service = service;
    }

    /** Lets the dialogs check a PLZ while typing; saving is validated again by @GueltigePostleitzahl. */
    @GetMapping("/{plz}")
    public Map<String, Object> check(@PathVariable String plz) {
        return Map.of("plz", plz, "gueltig", service.isGueltig(plz));
    }
}
