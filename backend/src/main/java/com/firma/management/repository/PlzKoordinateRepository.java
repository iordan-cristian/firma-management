package com.firma.management.repository;

import com.firma.management.entity.PlzKoordinate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlzKoordinateRepository extends JpaRepository<PlzKoordinate, String> {
}
