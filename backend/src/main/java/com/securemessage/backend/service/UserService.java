package com.securemessage.backend.service;

import com.securemessage.backend.exception.ErrorCode;
import com.securemessage.backend.exception.UserException;
import com.securemessage.backend.model.User;
import com.securemessage.backend.repository.UserRepository;
import java.util.List;
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
      byte[] signedPreKeySignature,
      List<User.PreKeyRecord> oneTimePreKeys) {
    log.info("Registering new anonymous user");
    User user = new User();
    user.setUuid(UUID.randomUUID().toString());

    if (password.length() < 9)
      throw new UserException(
          ErrorCode.PASSWORD_MUST_BE_LONGER, ErrorCode.PASSWORD_MUST_BE_LONGER.getDefaultMessage());

    user.setPasswordHash(passwordEncoder.encode(password));
    user.setIdentityKey(identityKey);
    user.setSignedPreKey(signedPreKey);
    user.setSignedPreKeyId(signedPreKeyId);
    user.setSignedPreKeySignature(signedPreKeySignature);
    user.setOneTimePreKeys(oneTimePreKeys);

    User savedUser = userRepository.save(user);
    log.info("Anonymous user registered successfully");
    return savedUser;
  }

  public User findByUuidOrThrow(String uuid) {
    User user = userRepository.findByUuid(uuid).orElse(null);
    if (user == null) {
      log.warn("User not found for UUID {}", uuid);
      throw new UserException(ErrorCode.USER_NOT_FOUND);
    }
    return user;
  }

  public void loginOrThrow(String uuid, String password) {
    User user = findByUuidOrThrow(uuid);
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      log.warn("Login failed: User {} the password was incorrect", uuid);
      throw new UserException(ErrorCode.PASSWORD_INCORRECT);
    }
  }
}
