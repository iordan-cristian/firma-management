package com.firma.management.controller;

import com.firma.management.dto.LoginRequest;
import com.firma.management.dto.LoginResponse;
import com.firma.management.dto.RegisterRequest;
import com.firma.management.entity.AppUser;
import com.firma.management.repository.AppUserRepository;
import com.firma.management.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          AppUserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
            );
            AppUser user = userRepository.findByUsername(auth.getName()).orElseThrow();
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
            return ResponseEntity.ok(new LoginResponse(token, user.getUsername(), user.getRole()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            return ResponseEntity.status(409).body("Username already exists");
        }
        String role = "ADMIN".equals(req.role()) ? "ADMIN" : "USER";
        AppUser user = AppUser.builder()
                .username(req.username())
                .password(passwordEncoder.encode(req.password()))
                .role(role)
                .build();
        userRepository.save(user);
        return ResponseEntity.status(201).body(Map.of("username", user.getUsername(), "role", user.getRole()));
    }
}
