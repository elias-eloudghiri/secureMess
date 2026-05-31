package com.securemessage.backend.controller;

import com.securemessage.backend.dto.AuthResponse;
import com.securemessage.backend.dto.LoginRequest;
import com.securemessage.backend.dto.RegisterRequest;
import com.securemessage.backend.model.User;
import com.securemessage.backend.service.JwtService;
import com.securemessage.backend.service.UserService;
import jakarta.validation.Valid;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

  private final UserService userService;
  private final JwtService jwtService;

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {

    // Decode Base64 keys to bytes
    byte[] identityKey = Base64.getDecoder().decode(request.identityKey());
    byte[] signedPreKey = Base64.getDecoder().decode(request.signedPreKey());
    byte[] signedPreKeySignature = Base64.getDecoder().decode(request.signedPreKeySignature());

    log.info("Prekeys from request: {}", request.oneTimePreKeys().size());
    log.info(
        "PreKeys from request content: {}",
        request.oneTimePreKeys().stream()
            .map(
                pk ->
                    "keyId="
                        + pk.keyId()
                        + " pubKey="
                        + Base64.getEncoder().encodeToString(pk.publicKey().getBytes()))
            .collect(Collectors.joining(", ")));
    List<User.PreKeyRecord> preKeys =
        request.oneTimePreKeys().stream()
            .map(
                pk -> {
                  User.PreKeyRecord record = new User.PreKeyRecord();
                  record.setKeyId(pk.keyId());
                  record.setPublicKey(Base64.getDecoder().decode(pk.publicKey()));
                  return record;
                })
            .toList();
    log.info("PreKeys count: {}", preKeys.size());
    log.info(
        "PreKeys content: {}",
        preKeys.stream()
            .map(
                pk ->
                    "keyId="
                        + pk.getKeyId()
                        + " pubKey="
                        + Base64.getEncoder().encodeToString(pk.getPublicKey()))
            .collect(Collectors.joining(", ")));
    User user =
        userService.registerAnonymousUser(
            request.password(),
            identityKey,
            signedPreKey,
            request.signedPreKeyId(),
            signedPreKeySignature,
            preKeys);

    String accessToken = jwtService.generateAccessToken(user.getUuid());
    String refreshToken = jwtService.generateRefreshToken(user.getUuid());

    return ResponseEntity.ok(new AuthResponse(user.getUuid(), accessToken, refreshToken));
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    userService.loginOrThrow(loginRequest.uuid(), loginRequest.password());

    String accessToken = jwtService.generateAccessToken(loginRequest.uuid());
    String refreshToken = jwtService.generateRefreshToken(loginRequest.uuid());

    return ResponseEntity.ok(new AuthResponse(loginRequest.uuid(), accessToken, refreshToken));
  }

  @PostMapping("/refresh")
  public ResponseEntity<?> refresh(@RequestParam String refreshToken) {
    try {
      String uuid = jwtService.extractUuid(refreshToken);
      if (jwtService.isTokenValid(refreshToken, uuid)) {
        String newAccessToken = jwtService.generateAccessToken(uuid);
        return ResponseEntity.ok(new AuthResponse(uuid, newAccessToken, refreshToken));
      }
    } catch (Exception e) {
      // Token invalid/expired
    }
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired refresh token");
  }
}
