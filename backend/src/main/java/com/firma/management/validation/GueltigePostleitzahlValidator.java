package com.firma.management.validation;

import com.firma.management.service.PlzService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Created by Spring's validator factory, so PlzService is injected. Runs only for @Valid request
 * bodies: Hibernate's own entity validation is switched off (see application.yml), because it
 * would create this validator without Spring.
 */
public class GueltigePostleitzahlValidator implements ConstraintValidator<GueltigePostleitzahl, Object> {

    private final PlzService plzService;

    public GueltigePostleitzahlValidator(PlzService plzService) {
        this.plzService = plzService;
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null || value.toString().isBlank()) return true;
        return plzService.isGueltig(value);
    }
}
