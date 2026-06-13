package com.securemessage.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.securemessage.backend.exception.ErrorCode;
import com.securemessage.backend.exception.UserException;
import com.securemessage.backend.model.Conversation;
import com.securemessage.backend.model.Message;
import com.securemessage.backend.model.User;
import com.securemessage.backend.repository.ConversationRepository;
import com.securemessage.backend.repository.MessageRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class MessageServiceTest {

  @Mock private ConversationRepository conversationRepository;
  @Mock private MessageRepository messageRepository;

  @InjectMocks private MessageService messageService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void createMessage_savesMessage_whenConversationExistsAndUserIsParticipant() {
    String conversationId = "conversation-1";
    String messageContent = "encrypted-message";
    User user = user("user-1");
    Conversation conversation = conversation(conversationId, List.of(user.getUuid(), "user-2"));
    Message savedMessage = message("message-1");

    when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));
    when(messageRepository.save(any(Message.class))).thenReturn(savedMessage);

    Message result = messageService.createMessage(messageContent, conversationId, user);

    assertSame(savedMessage, result);
    ArgumentCaptor<Message> messageCaptor = ArgumentCaptor.forClass(Message.class);
    verify(messageRepository).save(messageCaptor.capture());
    Message messageToSave = messageCaptor.getValue();
    assertEquals(conversationId, messageToSave.getConversationId());
    assertEquals(user.getUuid(), messageToSave.getSenderId());
    assertEquals("user-2", messageToSave.getReceiverId());
    assertEquals(messageContent, messageToSave.getEncryptedContent());
    assertEquals(1, messageToSave.getType());
    assertNotNull(messageToSave.getTimestamp());
    assertTrue(messageToSave.isDelivered());
  }

  @Test
  void createMessage_usesFirstParticipantDifferentFromSenderAsReceiver() {
    String conversationId = "conversation-1";
    User user = user("user-1");
    Conversation conversation =
        conversation(conversationId, List.of("user-2", user.getUuid(), "user-3"));
    Message savedMessage = message("message-1");

    when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));
    when(messageRepository.save(any(Message.class))).thenReturn(savedMessage);

    messageService.createMessage("encrypted-message", conversationId, user);

    ArgumentCaptor<Message> messageCaptor = ArgumentCaptor.forClass(Message.class);
    verify(messageRepository).save(messageCaptor.capture());
    assertEquals("user-2", messageCaptor.getValue().getReceiverId());
  }

  @Test
  void createMessage_throwsConversationNotFound_whenConversationDoesNotExist() {
    String conversationId = "unknown-conversation";
    User user = user("user-1");
    when(conversationRepository.findById(conversationId)).thenReturn(Optional.empty());

    UserException exception =
        assertThrows(
            UserException.class,
            () -> messageService.createMessage("encrypted-message", conversationId, user));

    assertEquals(ErrorCode.CONVERSATION_NOT_FOUND, exception.getErrorCode());
    assertEquals("Conversation with id unknown-conversation was not found", exception.getMessage());
    verifyNoInteractions(messageRepository);
  }

  @Test
  void createMessage_throwsConversationNotFound_whenUserIsNotParticipant() {
    String conversationId = "conversation-1";
    User user = user("user-1");
    Conversation conversation = conversation(conversationId, List.of("user-2", "user-3"));
    when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));

    UserException exception =
        assertThrows(
            UserException.class,
            () -> messageService.createMessage("encrypted-message", conversationId, user));

    assertEquals(ErrorCode.CONVERSATION_NOT_FOUND, exception.getErrorCode());
    assertEquals("Conversation with id conversation-1 was not found", exception.getMessage());
    verify(messageRepository, never()).save(any(Message.class));
  }

  @Test
  void createMessage_throwsInvalidConversationParticipants_whenSenderIsOnlyParticipant() {
    String conversationId = "conversation-1";
    User user = user("user-1");
    Conversation conversation = conversation(conversationId, List.of(user.getUuid()));
    when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));

    UserException exception =
        assertThrows(
            UserException.class,
            () -> messageService.createMessage("encrypted-message", conversationId, user));

    assertEquals(ErrorCode.INVALID_CONVERSATION_PARTICIPANTS, exception.getErrorCode());
    assertEquals("Invalid conversation participants", exception.getMessage());
    verify(messageRepository, never()).save(any(Message.class));
  }

  @Test
  void createMessage_throwsInvalidConversationParticipants_whenParticipantsAreOnlySenderDuplicates() {
    String conversationId = "conversation-1";
    User user = user("user-1");
    Conversation conversation =
        conversation(conversationId, List.of(user.getUuid(), user.getUuid()));
    when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));

    UserException exception =
        assertThrows(
            UserException.class,
            () -> messageService.createMessage("encrypted-message", conversationId, user));

    assertEquals(ErrorCode.INVALID_CONVERSATION_PARTICIPANTS, exception.getErrorCode());
    assertEquals("Invalid conversation participants", exception.getMessage());
    verify(messageRepository, never()).save(any(Message.class));
  }

  private User user(String uuid) {
    User user = new User();
    user.setUuid(uuid);
    return user;
  }

  private Conversation conversation(String id, List<String> participants) {
    Conversation conversation = new Conversation();
    conversation.setId(id);
    conversation.setParticipants(participants);
    return conversation;
  }

  private Message message(String id) {
    Message message = new Message();
    message.setId(id);
    return message;
  }
}
