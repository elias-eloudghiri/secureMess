package com.securemessage.backend.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.securemessage.backend.dto.PreKeyBundleResponse;
import com.securemessage.backend.model.User;
import com.securemessage.backend.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

public class SignalControllerTest {

  @Mock private UserRepository userRepository;

  @InjectMocks private SignalController signalController;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void testGetPreKeyBundle_Success() {
    User mockUser = new User();
    mockUser.setUsername("test-uuid");
    mockUser.setIdentityKey("identityKeyData".getBytes());
    mockUser.setSignedPreKey("signedKeyData".getBytes());
    mockUser.setSignedPreKeyId(1);
    mockUser.setSignedPreKeySignature("signatureData".getBytes());

    List<User.PreKeyRecord> preKeys = new ArrayList<>();
    User.PreKeyRecord pk = new User.PreKeyRecord();
    pk.setKeyId(10);
    pk.setPublicKey("pkData".getBytes());
    preKeys.add(pk);
    mockUser.setOneTimePreKeys(preKeys);

    when(userRepository.findByUsername("test-uuid")).thenReturn(Optional.of(mockUser));

    ResponseEntity<PreKeyBundleResponse> response = signalController.getPreKeyBundle("test-uuid");

    assertEquals(200, response.getStatusCode().value());
    PreKeyBundleResponse body = response.getBody();
    assertNotNull(body);
    assertNotNull(body.getIdentityKey());
    assertNotNull(body.getPreKey());
    assertEquals(10, body.getPreKey().getKeyId());

    // Verify the prekey was removed and user saved
    assertTrue(mockUser.getOneTimePreKeys().isEmpty());
    verify(userRepository, times(1)).save(mockUser);
  }

  @Test
  void testGetPreKeyBundle_UserNotFound() {
    when(userRepository.findByUsername("unknown-uuid")).thenReturn(Optional.empty());

    assertThrows(
        RuntimeException.class,
        () -> {
          signalController.getPreKeyBundle("unknown-uuid");
        });
  }
}
