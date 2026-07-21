package com.securemessage.backend.controller;

import com.securemessage.backend.model.Conversation;
import com.securemessage.backend.model.Message;
import com.securemessage.backend.model.User;
import com.securemessage.backend.service.ConversationService;
import com.securemessage.backend.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {

  private final ConversationService conversationService;
  private final UserService userService;

  private User getCurrentUser() {
    String UserUuid = SecurityContextHolder.getContext().getAuthentication().getName();
    return userService.findByUuidOrThrow(UserUuid);
  }

  @GetMapping("/")
  public ResponseEntity<List<Conversation>> getConversations() {
    User user = getCurrentUser();
    return ResponseEntity.ok(conversationService.getConversationsOfUser(user.getUuid()));
  }

  @GetMapping("/{conversationId}/messages")
  public ResponseEntity<List<Message>> getMessages(@PathVariable String conversationId) {
    User user = getCurrentUser();
    return ResponseEntity.ok(conversationService.getMessagesOfConversation(user, conversationId));
  }

  @PostMapping("/")
  public ResponseEntity<Conversation> createConversation(@RequestBody List<String> participants) {
    User user = getCurrentUser();
    return ResponseEntity.ok(conversationService.createConversation(user, participants));
  }
}
