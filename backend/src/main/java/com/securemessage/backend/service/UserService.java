package com.securemessage.backend.service;

import com.securemessage.backend.exception.ErrorCode;
import com.securemessage.backend.exception.UserException;
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
    user.setUuid(UUID.randomUUID().toString());
    user.setPasswordHash(passwordEncoder.encode(password));
    user.setIdentityKey(identityKey);
    user.setSignedPreKey(signedPreKey);
    user.setSignedPreKeyId(signedPreKeyId);
    user.setSignedPreKeySignature(signedPreKeySignature);

    User savedUser = userRepository.save(user);
    log.info("Anonymous user registered successfully. Username: {}", savedUser.getUuid());
    return savedUser;
  }

  public User findByUuid(String uuid) {
    return userRepository.findByUuid(uuid).orElse(null);
  }

  public void loginOrThrow(String uuid, String password) {
    User user = findByUuid(uuid);
    if (user == null) {
      log.warn("Login failed: User not found for UUID {}", uuid);
      throw new UserException(ErrorCode.USER_NOT_FOUND);
    }
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      log.warn("Login failed: User {} the password was incorrect", uuid);
      throw new UserException(ErrorCode.PASSWORD_INCORRECT);
    }
  }
}
