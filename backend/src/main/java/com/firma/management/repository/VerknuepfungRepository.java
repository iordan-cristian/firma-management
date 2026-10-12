package com.firma.management.repository;

import com.firma.management.entity.Verknuepfung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VerknuepfungRepository extends JpaRepository<Verknuepfung, UUID> {
    List<Verknuepfung> findAllBySuchauftragId(UUID suchauftragId);
    List<Verknuepfung> findAllByFirmaId(UUID firmaId);
    List<Verknuepfung> findAllByKandidatId(UUID kandidatId);
    void deleteBySuchauftragIdAndKandidatId(UUID suchauftragId, UUID kandidatId);
    boolean existsBySuchauftragIdAndKandidatId(UUID suchauftragId, UUID kandidatId);

    /** Rows of [Verknuepfung, Geschlecht, Titel, vorname, nachname] for every Verknüpfung between a Suchauftrag and an existing Kandidat. */
    @Query("""
            SELECT v, k.geschlecht, k.titel, k.vorname, k.nachname
            FROM Verknuepfung v JOIN Kandidat k ON k.id = v.kandidatId
            WHERE v.suchauftragId IS NOT NULL
            """)
    List<Object[]> findSuchauftragLinksMitKandidat();
}
