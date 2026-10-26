package com.firma.management.repository;

import com.firma.management.entity.VerknuepfungArchiviert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VerknuepfungArchiviertRepository extends JpaRepository<VerknuepfungArchiviert, UUID> {
    List<VerknuepfungArchiviert> findAllByKandidatId(UUID kandidatId);

    /** Rows of [VerknuepfungArchiviert, Geschlecht, Titel, vorname, nachname] for every archived Verknüpfung between a Suchauftrag and an existing Kandidat. */
    @Query("""
            SELECT v, k.geschlecht, k.titel, k.vorname, k.nachname
            FROM VerknuepfungArchiviert v JOIN Kandidat k ON k.id = v.kandidatId
            WHERE v.suchauftragId IS NOT NULL
            """)
    List<Object[]> findSuchauftragLinksMitKandidat();
}
