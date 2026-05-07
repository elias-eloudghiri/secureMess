package com.securemessage.backend.service;

import com.securemessage.backend.exception.ErrorCode;
import com.securemessage.backend.exception.UserException;
import com.securemessage.backend.model.*;
import com.securemessage.backend.repository.ConversationRepository;
import com.securemessage.backend.repository.MessageRepository;
import java.util.Date;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {
  private final ConversationRepository conversationRepository;
  private final MessageRepository messageRepository;

  private void throwConversationNotFound(String conversationId) {
    throw new UserException(
        ErrorCode.CONVERSATION_NOT_FOUND,
        "Conversation with id " + conversationId + " was not found");
  }

  public Message createMessage(String messageContent, String conversationId, User user) {
    log.info("Creating message in conversation {}: {}", conversationId, messageContent);

    Optional<Conversation> conversationTemp = conversationRepository.findById(conversationId);
    if (conversationTemp.isEmpty()) {
      log.error("Conversation not found: {}", conversationId);
      throwConversationNotFound(conversationId);
    }
    Conversation conversation = conversationTemp.get();
    if (!conversation.getParticipants().contains(user.getUuid())) {
      log.error("Conversation not Found: {}", conversationId);
      throwConversationNotFound(conversationId);
    }
    String receiverId =
        conversation.getParticipants().stream()
            .filter(participant -> !participant.equals(user.getUuid()))
            .findFirst()
            .orElseThrow(() -> new UserException(ErrorCode.INVALID_CONVERSATION_PARTICIPANTS));

    Message newMessage = new Message();
    newMessage.setConversationId(conversationId);
    newMessage.setSenderId(user.getId());
    newMessage.setReceiverId(receiverId);
    newMessage.setEncryptedContent(messageContent);
    newMessage.setType(1); // Assuming 1 for regular SignalMessage, adjust as needed
    newMessage.setTimestamp(new Date());
    newMessage.setDelivered(true);

    return messageRepository.save(newMessage);
  }
}
