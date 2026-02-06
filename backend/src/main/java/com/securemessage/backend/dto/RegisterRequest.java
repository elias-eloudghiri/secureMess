package com.securemessage.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class RegisterRequest {
    private String password;
    // Base64 encoded keys
    private String identityKey;
    private String signedPreKey;
    private int signedPreKeyId;
    private String signedPreKeySignature;
    private List<PreKeyRecordDto> oneTimePreKeys;

    @Data
    public static class PreKeyRecordDto {
        private int keyId;
        private String publicKey;
    }
}
