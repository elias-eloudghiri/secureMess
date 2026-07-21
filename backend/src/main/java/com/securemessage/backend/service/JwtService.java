package com.securemessage.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  // Default secret for dev. In prod, this should be injected via env variables
  // and be at least 256 bits.
  @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
  private String jwtSecret;

  @Value("${jwt.access.expirationMs:900000}") // 15 minutes
  private long jwtAccessExpirationMs;

  @Value("${jwt.refresh.expirationMs:604800000}") // 7 days
  private long jwtRefreshExpirationMs;

  private SecretKey getSigningKey() {
    byte[] keyBytes = jwtSecret.getBytes();
    return Keys.hmacShaKeyFor(keyBytes);
  }

  public String generateAccessToken(String uuid) {
    return generateToken(uuid, jwtAccessExpirationMs);
  }

  public String generateRefreshToken(String uuid) {
    return generateToken(uuid, jwtRefreshExpirationMs);
  }

  private String generateToken(String subject, long expirationMs) {
    return Jwts.builder()
        .subject(subject)
        .issuedAt(new Date())
        .expiration(new Date((new Date()).getTime() + expirationMs))
        .signWith(getSigningKey())
        .compact();
  }

  public String extractUuid(String token) {
    return extractAllClaims(token).getSubject();
  }

  public boolean isTokenValid(String token, String uuid) {
    final String extractedUuid = extractUuid(token);
    return (extractedUuid.equals(uuid) && !isTokenExpired(token));
  }

  private boolean isTokenExpired(String token) {
    return extractAllClaims(token).getExpiration().before(new Date());
  }

  private Claims extractAllClaims(String token) {
    return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
  }
}
