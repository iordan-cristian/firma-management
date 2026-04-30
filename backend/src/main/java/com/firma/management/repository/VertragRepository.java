package com.firma.management.repository;

import com.firma.management.entity.Vertrag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VertragRepository extends JpaRepository<Vertrag, UUID> {
    List<Vertrag> findAllByFirmaId(UUID firmaId);
    List<Vertrag> findAllByAnsprechpartnerId(UUID ansprechpartnerId);
    List<Vertrag> findAllByOrderByBezahlbarAmAsc();
}
