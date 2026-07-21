package com.securemessage.backend.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class JwtServiceTest {

  private static final String JWT_SECRET = "01234567890123456789012345678912";
  private static final String OTHER_JWT_SECRET = "abcdefghijklmnopqrstuvwxyz123456";
  private static final String USER_UUID = "user-1";
  private static final long ACCESS_EXPIRATION_MS = 60_000;
  private static final long REFRESH_EXPIRATION_MS = 120_000;

  @Test
  void generateAccessToken_containsUuidAndIsValid() {
    JwtService jwtService = jwtService(JWT_SECRET, ACCESS_EXPIRATION_MS, REFRESH_EXPIRATION_MS);

    String token = jwtService.generateAccessToken(USER_UUID);

    assertNotNull(token);
    assertEquals(USER_UUID, jwtService.extractUuid(token));
    assertTrue(jwtService.isTokenValid(token, USER_UUID));
  }

  @Test
  void generateAccessToken_usesConfiguredAccessExpiration() {
    JwtService jwtService = jwtService(JWT_SECRET, ACCESS_EXPIRATION_MS, REFRESH_EXPIRATION_MS);

    String token = jwtService.generateAccessToken(USER_UUID);

    Claims claims = parseClaims(token, JWT_SECRET);
    assertEquals(USER_UUID, claims.getSubject());
    assertDurationCloseTo(ACCESS_EXPIRATION_MS, claims);
  }

  @Test
  void generateRefreshToken_usesConfiguredRefreshExpiration() {
    JwtService jwtService = jwtService(JWT_SECRET, ACCESS_EXPIRATION_MS, REFRESH_EXPIRATION_MS);

    String token = jwtService.generateRefreshToken(USER_UUID);

    Claims claims = parseClaims(token, JWT_SECRET);
    assertEquals(USER_UUID, claims.getSubject());
    assertDurationCloseTo(REFRESH_EXPIRATION_MS, claims);
    assertTrue(jwtService.isTokenValid(token, USER_UUID));
  }

  @Test
  void isTokenValid_returnsFalse_whenUuidDoesNotMatch() {
    JwtService jwtService = jwtService(JWT_SECRET, ACCESS_EXPIRATION_MS, REFRESH_EXPIRATION_MS);
    String token = jwtService.generateAccessToken(USER_UUID);

    boolean result = jwtService.isTokenValid(token, "another-user");

    assertFalse(result);
  }

  @Test
  void isTokenValid_throwsJwtException_whenTokenIsExpired() {
    JwtService jwtService = jwtService(JWT_SECRET, -1_000, REFRESH_EXPIRATION_MS);
    String token = jwtService.generateAccessToken(USER_UUID);

    assertThrows(JwtException.class, () -> jwtService.isTokenValid(token, USER_UUID));
  }

  @Test
  void extractUuid_throwsJwtException_whenTokenIsMalformed() {
    JwtService jwtService = jwtService(JWT_SECRET, ACCESS_EXPIRATION_MS, REFRESH_EXPIRATION_MS);

    assertThrows(JwtException.class, () -> jwtService.extractUuid("not-a-jwt-token"));
  }

  @Test
  void extractUuid_throwsJwtException_whenTokenSignatureIsInvalid() {
    JwtService jwtService = jwtService(JWT_SECRET, ACCESS_EXPIRATION_MS, REFRESH_EXPIRATION_MS);
    JwtService jwtServiceWithOtherSecret =
        jwtService(OTHER_JWT_SECRET, ACCESS_EXPIRATION_MS, REFRESH_EXPIRATION_MS);
    String token = jwtService.generateAccessToken(USER_UUID);

    assertThrows(JwtException.class, () -> jwtServiceWithOtherSecret.extractUuid(token));
  }

  @Test
  void extractUuid_doesNotThrow_whenTokenSignatureIsValid() {
    JwtService jwtService = jwtService(JWT_SECRET, ACCESS_EXPIRATION_MS, REFRESH_EXPIRATION_MS);
    String token = jwtService.generateAccessToken(USER_UUID);

    assertDoesNotThrow(() -> jwtService.extractUuid(token));
  }

  private JwtService jwtService(String secret, long accessExpirationMs, long refreshExpirationMs) {
    JwtService jwtService = new JwtService();
    ReflectionTestUtils.setField(jwtService, "jwtSecret", secret);
    ReflectionTestUtils.setField(jwtService, "jwtAccessExpirationMs", accessExpirationMs);
    ReflectionTestUtils.setField(jwtService, "jwtRefreshExpirationMs", refreshExpirationMs);
    return jwtService;
  }

  private Claims parseClaims(String token, String secret) {
    return Jwts.parser()
        .verifyWith(signingKey(secret))
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  private SecretKey signingKey(String secret) {
    return Keys.hmacShaKeyFor(secret.getBytes());
  }

  private void assertDurationCloseTo(long expectedDurationMs, Claims claims) {
    long durationMs = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();
    assertTrue(durationMs >= expectedDurationMs - 1_000);
    assertTrue(durationMs <= expectedDurationMs + 1_000);
  }
}
