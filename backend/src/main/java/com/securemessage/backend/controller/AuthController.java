package com.securemessage.backend.controller;

import com.securemessage.backend.dto.AuthResponse;
import com.securemessage.backend.dto.LoginRequest;
import com.securemessage.backend.dto.RegisterRequest;
import com.securemessage.backend.model.User;
import com.securemessage.backend.service.JwtService;
import com.securemessage.backend.service.UserService;
import jakarta.validation.Valid;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final UserService userService;
  private final JwtService jwtService;

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {

    // Decode Base64 keys to bytes
    byte[] identityKey = Base64.getDecoder().decode(request.identityKey());
    byte[] signedPreKey = Base64.getDecoder().decode(request.signedPreKey());
    byte[] signedPreKeySignature = Base64.getDecoder().decode(request.signedPreKeySignature());

    User user =
        userService.registerAnonymousUser(
            request.password(),
            identityKey,
            signedPreKey,
            request.signedPreKeyId(),
            signedPreKeySignature);

    String accessToken = jwtService.generateAccessToken(user.getUsername());
    String refreshToken = jwtService.generateRefreshToken(user.getUsername());

    return ResponseEntity.ok(new AuthResponse(user.getUsername(), accessToken, refreshToken));
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    boolean success = userService.login(loginRequest.uuid(), loginRequest.password());
    if (!success) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid UUID or password");
    }

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
