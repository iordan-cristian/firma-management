package com.firma.management.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * The PLZ must exist in plz_koordinate (German postal codes). Empty is allowed.
 * Works on String and Integer fields (Kandidat stores the PLZ as a number).
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = GueltigePostleitzahlValidator.class)
public @interface GueltigePostleitzahl {
    String message() default "Unbekannte Postleitzahl";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
