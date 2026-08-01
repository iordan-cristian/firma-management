package com.firma.management.repository;

import com.firma.management.entity.Status;
import com.firma.management.entity.Suchauftrag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface SuchauftragRepository extends JpaRepository<Suchauftrag, UUID> {
    List<Suchauftrag> findAllByStatus(Status status);

    @Query("SELECT s FROM Suchauftrag s WHERE s.ansprechpartnerId IN :ansprechpartnerIds ORDER BY s.anlageDatum DESC NULLS LAST")
    List<Suchauftrag> findAllByAnsprechpartnerIdIn(@Param("ansprechpartnerIds") Collection<UUID> ansprechpartnerIds);

    List<Suchauftrag> findAllByAnsprechpartnerId(UUID ansprechpartnerId);
}
