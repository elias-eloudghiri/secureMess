package com.securemessage.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record RegisterRequest(
    @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,
    @NotBlank(message = "Identity key is required") String identityKey,
    @NotBlank(message = "Signed PreKey is required") String signedPreKey,
    @NotNull(message = "Signed PreKey ID is required") Integer signedPreKeyId,
    @NotBlank(message = "Signed PreKey Signature is required") String signedPreKeySignature,
    @NotNull(message = "One-time PreKeys are required") @Valid
        List<PreKeyRecordDto> oneTimePreKeys) {
  public record PreKeyRecordDto(
      @NotNull(message = "Key ID is required") Integer keyId,
      @NotBlank(message = "Public Key is required") String publicKey) {}
}
