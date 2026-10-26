package com.firma.management.repository;

import com.firma.management.dto.SuchauftragUebersichtResponse;
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
    @Query("SELECT s FROM Suchauftrag s WHERE s.ansprechpartnerId IN :ansprechpartnerIds ORDER BY s.anlageDatum DESC NULLS LAST")
    List<Suchauftrag> findAllByAnsprechpartnerIdIn(@Param("ansprechpartnerIds") Collection<UUID> ansprechpartnerIds);

    List<Suchauftrag> findAllByAnsprechpartnerId(UUID ansprechpartnerId);

    /** Suchaufträge with Firma and Ansprechpartner fields; the kandidaten list is filled by the service. */
    @Query("""
            SELECT new com.firma.management.dto.SuchauftragUebersichtResponse(
                s, a.firmaId, f.name, a.geschlecht, a.titel, a.vorname, a.nachname)
            FROM Suchauftrag s
            LEFT JOIN Ansprechpartner a ON a.id = s.ansprechpartnerId
            LEFT JOIN Firma f ON f.id = a.firmaId
            """)
    List<SuchauftragUebersichtResponse> findUebersicht();
}
