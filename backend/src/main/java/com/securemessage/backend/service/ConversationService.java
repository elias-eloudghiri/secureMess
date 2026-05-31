package com.securemessage.backend.service;

import com.securemessage.backend.exception.ErrorCode;
import com.securemessage.backend.exception.UserException;
import com.securemessage.backend.model.Conversation;
import com.securemessage.backend.model.Message;
import com.securemessage.backend.model.User;
import com.securemessage.backend.repository.ConversationRepository;
import com.securemessage.backend.repository.MessageRepository;
import java.util.Date;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {

  private final ConversationRepository conversationRepository;
  private final MessageRepository messageRepository;
  private final UserService userService;

  public List<Conversation> getConversationsOfUser(String userUuid) {
    return conversationRepository.findByParticipantsContainingOrderByLastMessageAtDesc(userUuid);
  }

  public List<Message> getMessagesOfConversation(User user, String conversationId) {
    log.info("Fetching messages for conversation: {}", conversationId);

    Conversation conversation = conversationRepository.findById(conversationId).orElse(null);
    if (conversation == null) {
      log.error("Conversation not found: {}", conversationId);
      throw new UserException(
          ErrorCode.CONVERSATION_NOT_FOUND,
          "Conversation with id " + conversationId + " was not found");
    }
    if (!conversation.getParticipants().contains(user.getUuid())) {
      log.error("User {} is not a participant of conversation {}", user.getUuid(), conversationId);
      throw new UserException(
          ErrorCode.USER_NOT_FOUND_IN_PARTICIPANTS,
          "User with uuid " + user.getUuid() + " is not a participant of this conversation");
    }
    List<Message> messages =
        messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
    List<Message> messages2 = messageRepository.findByConversationId(conversationId);
    log.info("Found {} messages for conversation {}", messages.size(), conversationId);

    return messages;
  }

  public Conversation createConversation(User user, List<String> participants) {
    log.info("Creating conversation with participants: {}", participants);

    if (!participants.contains(user.getUuid())) {
      log.error(
          "User cannot create a conversation without being a participant: {}", user.getUuid());
      throw new UserException(
          ErrorCode.USER_NOT_FOUND_IN_PARTICIPANTS,
          "User must be a participant in the conversation");
    }
    for (String participantUuid : participants) {
      if (userService.findByUuid(participantUuid) == null) {
        log.error("User not found: {}", participantUuid);
        throw new UserException(
            ErrorCode.USER_NOT_FOUND, "User with uuid " + participantUuid + " was not found");
      }
    }
    Conversation conversation = new Conversation();
    conversation.setParticipants(participants);
    conversation.setLastMessageAt(new Date());
    conversation.setLastMessagePreview("");
    return conversationRepository.save(conversation);
  }
}
