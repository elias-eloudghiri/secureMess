package com.securemessage.backend.dto;

import lombok.Data;

@Data
public class PreKeyBundleResponse {
  private String identityKey;
  private String signedPreKey;
  private int signedPreKeyId;
  private String signedPreKeySignature;
  private PreKeyResponse preKey;

  @Data
  public static class PreKeyResponse {
    private int keyId;
    private String publicKey;
  }
}
