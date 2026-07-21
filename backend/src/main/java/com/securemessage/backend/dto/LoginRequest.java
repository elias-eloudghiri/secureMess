package com.securemessage.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Uuid is required") String uuid,
    @NotBlank(message = "Password is required") String password) {}
