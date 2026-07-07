package com.banking.auth_service.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.banking.auth_service.dto.AuthResponse;
import com.banking.auth_service.dto.LoginRequest;
import com.banking.auth_service.dto.RegisterRequest;
import com.banking.auth_service.entity.User;
import com.banking.auth_service.repo.UserRepository;
import com.banking.auth_service.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ── REGISTER ──────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {

        // Email already exists?
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        // User banao — password BCrypt se encrypt karo
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("ROLE_USER")
                .build();

        // FIXED: Catch the updated object from Hibernate containing the auto-increment
        // ID!
        User savedUser = userRepository.save(user);

        // JWT token generate karo
        String token = jwtUtil.generateToken(savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getName());

        // FIXED: Pass savedUser so id is never null!
        return buildResponse(token, savedUser);
    }

    // ── LOGIN ─────────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {

        // Email se user dhundho
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Password match karo — BCrypt se compare
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail(),
                user.getRole(),
                user.getName());

        return buildResponse(token, user);
    }

    // ── VALIDATE TOKEN ────────────────────────────────────
    public boolean validateToken(String token) {
        return jwtUtil.isTokenValid(token);
    }

    // ── HELPER ────────────────────────────────────────────
    private AuthResponse buildResponse(String token, User user) {
        return AuthResponse.builder()
                .id(user.getId()) // Will now cleanly receive the Long ID mapping
                .token(token)
                .type("Bearer")
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .expiresIn(86400000L)
                .build();
    }
}