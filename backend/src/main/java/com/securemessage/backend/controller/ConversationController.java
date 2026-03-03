package com.securemessage.backend.controller;

import com.securemessage.backend.model.Conversation;
import com.securemessage.backend.model.Message;
import com.securemessage.backend.repository.ConversationRepository;
import com.securemessage.backend.repository.MessageRepository;
import java.util.Date;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {

  private final ConversationRepository conversationRepository;
  private final MessageRepository messageRepository;

  @GetMapping("/user/{userId}")
  public ResponseEntity<List<Conversation>> getConversations(@PathVariable String userId) {
    return ResponseEntity.ok(
        conversationRepository.findByParticipantsContainingOrderByLastMessageAtDesc(userId));
  }

  @GetMapping("/{conversationId}/messages")
  public ResponseEntity<List<Message>> getMessages(@PathVariable String conversationId) {
    return ResponseEntity.ok(
        messageRepository.findByConversationIdOrderByTimestampAsc(conversationId));
  }

  @PostMapping
  public ResponseEntity<Conversation> createConversation(@RequestBody Conversation conversation) {
    if (conversation.getLastMessageAt() == null) {
      conversation.setLastMessageAt(new Date());
    }
    return ResponseEntity.ok(conversationRepository.save(conversation));
  }
}
