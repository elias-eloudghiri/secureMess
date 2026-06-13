package com.securemessage.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.securemessage.backend.exception.ErrorCode;
import com.securemessage.backend.exception.UserException;
import com.securemessage.backend.model.User;
import com.securemessage.backend.repository.UserRepository;
import java.util.ArrayList;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

class UserServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private PasswordEncoder passwordEncoder;
  private PasswordEncoder truePasswordEncoder;

  @InjectMocks private UserService userService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    truePasswordEncoder = new BCryptPasswordEncoder();
  }

  @Test
  void registerAnonymousUser_WhenPasswordIsLongEnough() {
    String passwordClear = "123456789";

    when(userRepository.save(any(User.class))).thenReturn(new User());
    User user =
        userService.registerAnonymousUser(
            passwordClear,
            "Bb/IuvlcyvqoKPaozEFn4nGiH64JMQT+Tqbq/53yOVx9".getBytes(),
            "BbDLVTTYoDCBs/O4Cdr3pI90hE4syP3LmESdfJiEMyY0".getBytes(),
            1,
            "6ZpUcTDMuyUGQLGA5hkpE2yQANRHTi9XlnYBjQB3Z+eM4JIy8rI4pMXyiIWttqC2zHMmp08TFR3sjUNesJjUhg=="
                .getBytes(),
            new ArrayList<>());
    verify(passwordEncoder).encode(anyString());
    verify(userRepository).save(any(User.class));
    assertNotNull(user);
  }

  @Test
  void findByUuidOrThrow() {
    String uuid = "user1";

    when(userRepository.findByUuid(uuid)).thenReturn(Optional.of(new User()));

    userService.findByUuidOrThrow(uuid);

    verify(userRepository).findByUuid(uuid);

    UserException exception =
        assertThrows(UserException.class, () -> userService.findByUuidOrThrow(""));

    assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
  }

  @Test
  void loginOrThrow() {
    String uuid = "user1";
    String clearPassword = "123456789";
    User user = new User();
    user.setUuid(uuid);
    user.setPasswordHash(truePasswordEncoder.encode(clearPassword));

    when(userRepository.findByUuid(uuid)).thenReturn(Optional.of(user));
    when(passwordEncoder.matches(clearPassword, user.getPasswordHash())).thenReturn(true);

    assertDoesNotThrow(() -> userService.loginOrThrow(uuid, clearPassword));

    when(passwordEncoder.matches(clearPassword, user.getPasswordHash())).thenReturn(false);

    UserException exception =
        assertThrows(UserException.class, () -> userService.loginOrThrow(uuid, clearPassword));
    assertEquals(ErrorCode.PASSWORD_INCORRECT, exception.getErrorCode());
  }
}
