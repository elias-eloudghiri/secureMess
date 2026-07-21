package com.securemessage.backend.controller;

import com.securemessage.backend.dto.CreateMessageDTO;
import com.securemessage.backend.model.User;
import com.securemessage.backend.service.MessageService;
import com.securemessage.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

  private final UserService userService;
  private final MessageService messageService;

  @PostMapping("/create/{conversationId}")
  public ResponseEntity<?> createMessage(
      @RequestBody CreateMessageDTO createMessageDTO, @PathVariable String conversationId) {
    log.info(
        "Creating message in conversation {}: {}",
        conversationId,
        createMessageDTO.messageContent());

    String UserUuid = SecurityContextHolder.getContext().getAuthentication().getName();
    User user = userService.findByUuidOrThrow(UserUuid);

    return ResponseEntity.ok(
        messageService.createMessage(createMessageDTO.messageContent(), conversationId, user));
  }
}
