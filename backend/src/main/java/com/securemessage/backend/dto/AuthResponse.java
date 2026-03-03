package com.securemessage.backend.dto;

public record AuthResponse(String uuid, String accessToken, String refreshToken) {}
