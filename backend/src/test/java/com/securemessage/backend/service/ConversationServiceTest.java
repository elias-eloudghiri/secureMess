package com.securemessage.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
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

public class ConversationServiceTest {

  @Mock private ConversationRepository conversationRepository;
  @Mock private MessageRepository messageRepository;
  @Mock private UserService userService;

  @InjectMocks private ConversationService conversationService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void getMessagesOfConversation_returnsMessages_whenConversationExistsAndUserIsParticipant() {
    String userUuid = "user-1";
    String conversationId = "conversation-1";
    User user = user(userUuid);
    Conversation conversation = conversation(conversationId, List.of(userUuid, "user-2"));
    Message firstMessage = message("message-1", conversationId);
    Message secondMessage = message("message-2", conversationId);
    List<Message> expectedMessages = List.of(firstMessage, secondMessage);

    when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));
    when(messageRepository.findByConversationIdOrderByTimestampAsc(conversationId))
        .thenReturn(expectedMessages);

    List<Message> result = conversationService.getMessagesOfConversation(user, conversationId);

    assertSame(expectedMessages, result);
    verify(conversationRepository).findById(conversationId);
    verify(messageRepository).findByConversationIdOrderByTimestampAsc(conversationId);
  }

  @Test
  void getMessagesOfConversation_returnsEmptyList_whenConversationHasNoMessages() {
    String userUuid = "user-1";
    String conversationId = "conversation-1";
    User user = user(userUuid);
    Conversation conversation = conversation(conversationId, List.of(userUuid, "user-2"));
    List<Message> expectedMessages = List.of();

    when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));
    when(messageRepository.findByConversationIdOrderByTimestampAsc(conversationId))
        .thenReturn(expectedMessages);

    List<Message> result = conversationService.getMessagesOfConversation(user, conversationId);

    assertSame(expectedMessages, result);
    verify(messageRepository).findByConversationIdOrderByTimestampAsc(conversationId);
  }

  @Test
  void getMessagesOfConversation_throwsConversationNotFound_whenConversationDoesNotExist() {
    User user = user("user-1");
    String conversationId = "unknown-conversation";
    when(conversationRepository.findById(conversationId)).thenReturn(Optional.empty());

    UserException exception =
        assertThrows(
            UserException.class,
            () -> conversationService.getMessagesOfConversation(user, conversationId));

    assertEquals(ErrorCode.CONVERSATION_NOT_FOUND, exception.getErrorCode());
    assertEquals("Conversation with id unknown-conversation was not found", exception.getMessage());
    verifyNoInteractions(messageRepository);
  }

  @Test
  void getMessagesOfConversation_throwsUserNotFoundInParticipants_whenUserIsNotParticipant() {
    User user = user("user-1");
    String conversationId = "conversation-1";
    Conversation conversation = conversation(conversationId, List.of("user-2", "user-3"));
    when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));

    UserException exception =
        assertThrows(
            UserException.class,
            () -> conversationService.getMessagesOfConversation(user, conversationId));

    assertEquals(ErrorCode.USER_NOT_FOUND_IN_PARTICIPANTS, exception.getErrorCode());
    assertEquals(
        "User with uuid user-1 is not a participant of this conversation", exception.getMessage());
    verifyNoInteractions(messageRepository);
  }

  @Test
  void createConversation_savesConversation_whenParticipantsAreValid() {
    User user = user("user-1");
    User otherParticipant = user("user-2");
    List<String> participants = List.of(user.getUuid(), otherParticipant.getUuid());
    Conversation savedConversation = conversation("conversation-1", participants);

    when(userService.findByUuidOrThrow(user.getUuid())).thenReturn(user);
    when(userService.findByUuidOrThrow(otherParticipant.getUuid())).thenReturn(otherParticipant);
    when(conversationRepository.save(any(Conversation.class))).thenReturn(savedConversation);

    Conversation result = conversationService.createConversation(user, participants);

    assertSame(savedConversation, result);
    ArgumentCaptor<Conversation> conversationCaptor = ArgumentCaptor.forClass(Conversation.class);
    verify(conversationRepository).save(conversationCaptor.capture());
    Conversation conversationToSave = conversationCaptor.getValue();
    assertEquals(participants, conversationToSave.getParticipants());
    assertNotNull(conversationToSave.getLastMessageAt());
    assertEquals("", conversationToSave.getLastMessagePreview());
  }

  @Test
  void createConversation_throwsUserNotFoundInParticipants_whenCreatorIsNotParticipant() {
    User user = user("user-1");
    List<String> participants = List.of("user-2", "user-3");

    UserException exception =
        assertThrows(
            UserException.class, () -> conversationService.createConversation(user, participants));

    assertEquals(ErrorCode.USER_NOT_FOUND_IN_PARTICIPANTS, exception.getErrorCode());
    assertEquals("User must be a participant in the conversation", exception.getMessage());
    verifyNoInteractions(userService);
    verify(conversationRepository, never()).save(any(Conversation.class));
  }

  @Test
  void createConversation_throwsUserCannotCreateConversationWithHimself_whenOnlyCreatorIsPresent() {
    User user = user("user-1");
    List<String> participants = List.of(user.getUuid());

    UserException exception =
        assertThrows(
            UserException.class, () -> conversationService.createConversation(user, participants));

    assertEquals(ErrorCode.USER_CANNOT_CREATE_CONVERSATION_WITH_HIMSELF, exception.getErrorCode());
    assertEquals("User cannot create a conversation with only themselves", exception.getMessage());
    verifyNoInteractions(userService);
    verify(conversationRepository, never()).save(any(Conversation.class));
  }

  @Test
  void
      createConversation_throwsUserCannotCreateConversationWithHimself_whenOnlyCreatorIsDuplicated() {
    User user = user("user-1");
    List<String> participants = List.of(user.getUuid(), user.getUuid());

    UserException exception =
        assertThrows(
            UserException.class, () -> conversationService.createConversation(user, participants));

    assertEquals(ErrorCode.USER_CANNOT_CREATE_CONVERSATION_WITH_HIMSELF, exception.getErrorCode());
    assertEquals("User cannot create a conversation with only themselves", exception.getMessage());
    verifyNoInteractions(userService);
    verify(conversationRepository, never()).save(any(Conversation.class));
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

  private Message message(String id, String conversationId) {
    Message message = new Message();
    message.setId(id);
    message.setConversationId(conversationId);
    return message;
  }
}
