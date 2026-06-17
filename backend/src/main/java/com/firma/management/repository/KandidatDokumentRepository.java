package com.firma.management.repository;

import com.firma.management.entity.KandidatDokument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface KandidatDokumentRepository extends JpaRepository<KandidatDokument, UUID> {
    List<KandidatDokument> findByKandidatId(UUID kandidatId);
    void deleteByKandidatId(UUID kandidatId);
}
