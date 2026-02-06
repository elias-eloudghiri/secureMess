package com.securemessage.backend.controller;

import com.securemessage.backend.dto.RegisterRequest;
import com.securemessage.backend.model.User;
import com.securemessage.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.securemessage.backend.exception.InvalidRegistrationException;
import java.util.Base64;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Decode Base64 keys to bytes
            byte[] identityKey = Base64.getDecoder().decode(request.getIdentityKey());
            byte[] signedPreKey = Base64.getDecoder().decode(request.getSignedPreKey());
            byte[] signedPreKeySignature = Base64.getDecoder().decode(request.getSignedPreKeySignature());

            // Convert oneTimePreKeys
            // Implementation omitted for brevity, logic inside service typically or mapper

            User user = userService.registerAnonymousUser(
                    request.getPassword(),
                    identityKey,
                    signedPreKey,
                    request.getSignedPreKeyId(),
                    signedPreKeySignature);

            return ResponseEntity.ok(user.getUsername());
        } catch (IllegalArgumentException e) {
            throw new InvalidRegistrationException("Failed to decode keys or invalid arguments", e);
        } catch (Exception e) {
            throw new InvalidRegistrationException("Registration failed: " + e.getMessage(), e);
        }
    }
}
