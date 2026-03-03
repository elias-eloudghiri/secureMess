package com.securemessage.backend.controller;

import com.securemessage.backend.dto.PreKeyBundleResponse;
import com.securemessage.backend.model.User;
import com.securemessage.backend.repository.UserRepository;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/signal")
@RequiredArgsConstructor
public class SignalController {

  private final UserRepository userRepository;

  @GetMapping("/prekey-bundle/{uuid}")
  public ResponseEntity<PreKeyBundleResponse> getPreKeyBundle(@PathVariable String uuid) {
    User user =
        userRepository
            .findByUsername(uuid) // Using username as UUID based on User.java mapping
            .orElseThrow(() -> new RuntimeException("User not found"));

    PreKeyBundleResponse response = new PreKeyBundleResponse();
    response.setIdentityKey(Base64.getEncoder().encodeToString(user.getIdentityKey()));
    response.setSignedPreKey(Base64.getEncoder().encodeToString(user.getSignedPreKey()));
    response.setSignedPreKeyId(user.getSignedPreKeyId());
    response.setSignedPreKeySignature(
        Base64.getEncoder().encodeToString(user.getSignedPreKeySignature()));

    if (user.getOneTimePreKeys() != null && !user.getOneTimePreKeys().isEmpty()) {
      // Pop the first key (in a real app, remove it from DB and save User)
      User.PreKeyRecord randomKey = user.getOneTimePreKeys().get(0);
      user.getOneTimePreKeys().remove(0);
      userRepository.save(user);

      PreKeyBundleResponse.PreKeyResponse pbKey = new PreKeyBundleResponse.PreKeyResponse();
      pbKey.setKeyId(randomKey.getKeyId());
      pbKey.setPublicKey(Base64.getEncoder().encodeToString(randomKey.getPublicKey()));
      response.setPreKey(pbKey);
    }

    return ResponseEntity.ok(response);
  }
}
