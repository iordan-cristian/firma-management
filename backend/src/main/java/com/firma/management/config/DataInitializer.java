package com.firma.management.config;

import com.firma.management.entity.AppUser;
import com.firma.management.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @org.springframework.context.annotation.Bean
    CommandLineRunner seedAdmin(
            AppUserRepository repo,
            PasswordEncoder encoder,
            @Value("${app.admin.username}") String adminUsername,
            @Value("${app.admin.password}") String adminPassword
    ) {
        return args -> {
            if (!repo.existsByUsername(adminUsername)) {
                AppUser admin = AppUser.builder()
                        .username(adminUsername)
                        .password(encoder.encode(adminPassword))
                        .role("ADMIN")
                        .build();
                repo.save(admin);
            }
        };
    }
}
