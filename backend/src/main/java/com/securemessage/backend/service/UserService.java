package com.securemessage.backend.service;

import com.securemessage.backend.model.User;
import com.securemessage.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User registerAnonymousUser(String password, byte[] identityKey, byte[] signedPreKey, int signedPreKeyId,
            byte[] signedPreKeySignature) {
        User user = new User();
        user.setUsername(UUID.randomUUID().toString());
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setIdentityKey(identityKey);
        user.setSignedPreKey(signedPreKey);
        user.setSignedPreKeyId(signedPreKeyId);
        user.setSignedPreKeySignature(signedPreKeySignature);

        return userRepository.save(user);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
}
