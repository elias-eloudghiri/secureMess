package com.securemessage.backend.service;

import com.securemessage.backend.model.User;
import com.securemessage.backend.repository.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public User registerAnonymousUser(
      String password,
      byte[] identityKey,
      byte[] signedPreKey,
      int signedPreKeyId,
      byte[] signedPreKeySignature) {
    log.info("Registering new anonymous user with signedPreKeyId: {}", signedPreKeyId);
    User user = new User();
    user.setUsername(UUID.randomUUID().toString());
    user.setPasswordHash(passwordEncoder.encode(password));
    user.setIdentityKey(identityKey);
    user.setSignedPreKey(signedPreKey);
    user.setSignedPreKeyId(signedPreKeyId);
    user.setSignedPreKeySignature(signedPreKeySignature);

    User savedUser = userRepository.save(user);
    log.info("Anonymous user registered successfully. Username: {}", savedUser.getUsername());
    return savedUser;
  }

  public User findByUuid(String uuid) {
    return userRepository.findByUsername(uuid).orElse(null);
  }

  public boolean login(String uuid, String password) {
    boolean response = false;
    User user = findByUuid(uuid);
    if (user == null) {
      log.warn("Login failed: User not found for UUID {}", uuid);
      return response;
    }
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      log.warn("Login failed: User {} the password was incorrect", uuid);
      return response;
    }
    return true;
  }
}
