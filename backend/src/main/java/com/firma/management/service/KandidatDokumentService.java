package com.firma.management.service;

import com.firma.management.config.UploadProperties;
import com.firma.management.entity.DokumentTyp;
import com.firma.management.entity.KandidatDokument;
import com.firma.management.repository.KandidatDokumentRepository;
import com.firma.management.repository.KandidatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
public class KandidatDokumentService {

    private final KandidatDokumentRepository repo;
    private final KandidatRepository kandidatRepo;
    private final S3Client s3;
    private final S3Presigner presigner;
    private final UploadProperties props;

    public KandidatDokumentService(KandidatDokumentRepository repo,
                                   KandidatRepository kandidatRepo,
                                   S3Client s3,
                                   S3Presigner presigner,
                                   UploadProperties props) {
        this.repo = repo;
        this.kandidatRepo = kandidatRepo;
        this.s3 = s3;
        this.presigner = presigner;
        this.props = props;
    }

    public List<KandidatDokument> listForKandidat(UUID kandidatId) {
        return repo.findByKandidatId(kandidatId);
    }

    @Transactional
    public KandidatDokument upload(UUID kandidatId, DokumentTyp dokumentTyp, MultipartFile file) throws IOException {
        if (!kandidatRepo.existsById(kandidatId)) {
            throw new NoSuchElementException("Kandidat not found: " + kandidatId);
        }
        String contentType = file.getContentType();
        if (contentType == null || !props.getAllowedMimeTypes().contains(contentType)) {
            throw new IllegalArgumentException("File type not allowed: " + contentType);
        }

        UUID docId = UUID.randomUUID();
        String sanitized = sanitize(file.getOriginalFilename());
        String objectKey = "kandidaten/" + kandidatId + "/" + docId + "_" + sanitized;

        s3.putObject(
                PutObjectRequest.builder()
                        .bucket(props.getBucket())
                        .key(objectKey)
                        .contentType(contentType)
                        .build(),
                RequestBody.fromInputStream(file.getInputStream(), file.getSize())
        );

        KandidatDokument doc = KandidatDokument.builder()
                .id(docId)
                .kandidatId(kandidatId)
                .dokumentTyp(dokumentTyp)
                .dateiname(file.getOriginalFilename())
                .objektKey(objectKey)
                .mimeType(contentType)
                .dateigroesse(file.getSize())
                .hochgeladenAm(OffsetDateTime.now())
                .build();
        return repo.save(doc);
    }

    public Optional<KandidatDokument> getMetadata(UUID docId) {
        return repo.findById(docId);
    }

    public String presignedDownloadUrl(KandidatDokument doc) {
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(props.getPresignedUrlTtlMinutes()))
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(props.getBucket())
                        .key(doc.getObjektKey())
                        .build())
                .build();
        return presigner.presignGetObject(presignRequest).url().toString();
    }

    @Transactional
    public boolean delete(UUID docId) {
        Optional<KandidatDokument> opt = repo.findById(docId);
        if (opt.isEmpty()) return false;
        s3.deleteObject(DeleteObjectRequest.builder()
                .bucket(props.getBucket())
                .key(opt.get().getObjektKey())
                .build());
        repo.deleteById(docId);
        return true;
    }

    @Transactional
    public void deleteAllForKandidat(UUID kandidatId) {
        List<KandidatDokument> docs = repo.findByKandidatId(kandidatId);
        for (KandidatDokument doc : docs) {
            s3.deleteObject(DeleteObjectRequest.builder()
                    .bucket(props.getBucket())
                    .key(doc.getObjektKey())
                    .build());
        }
        repo.deleteByKandidatId(kandidatId);
    }

    private String sanitize(String name) {
        if (name == null) return "upload";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
