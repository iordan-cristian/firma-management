package com.firma.management.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.upload")
@Getter
@Setter
public class UploadProperties {
    private String endpoint;
    private String bucket;
    private String accessKey;
    private String secretKey;
    private String region = "eu-central-1";
    private int presignedUrlTtlMinutes = 15;
    private List<String> allowedMimeTypes = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png"
    );
}
