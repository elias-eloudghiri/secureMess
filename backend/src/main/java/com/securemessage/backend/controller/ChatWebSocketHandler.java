package com.securemessage.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securemessage.backend.model.Message;
import com.securemessage.backend.repository.MessageRepository;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

  private final MessageRepository messageRepository;
  private final ObjectMapper objectMapper;

  // UUID -> Session Map
  private final Map<String, WebSocketSession> activeSessions = new ConcurrentHashMap<>();

  @Override
  public void afterConnectionEstablished(@NonNull WebSocketSession session) {
    // We expect the client to send an auth message or pass uuid in query params.
    // Given the JWT filter, it might be easier to have the client send its UUID
    // immediately
  }

  @Override
  protected void handleTextMessage(@NonNull WebSocketSession session, TextMessage message)
      throws Exception {
    String payload = message.getPayload();
    Map<String, Object> data = objectMapper.readValue(payload, Map.class);
    String type = (String) data.get("type");

    if ("AUTH".equals(type)) {
      String uuid = (String) data.get("uuid");
      if (uuid != null) {
        activeSessions.put(uuid, session);
      }
    } else if ("MESSAGE".equals(type)) {
      String senderId = (String) data.get("senderId");
      String receiverId = (String) data.get("receiverId");
      String encryptedContent = (String) data.get("encryptedContent");
      String conversationId = (String) data.get("conversationId");

      // Save to DB
      Message msg = new Message();
      msg.setSenderId(senderId);
      msg.setReceiverId(receiverId);
      msg.setEncryptedContent(encryptedContent);
      msg.setConversationId(conversationId);
      msg.setTimestamp(new java.util.Date());
      messageRepository.save(msg);

      // Relay to recipient if online
      WebSocketSession recipientSession = activeSessions.get(receiverId);
      if (recipientSession != null && recipientSession.isOpen()) {
        recipientSession.sendMessage(
            new TextMessage(
                objectMapper.writeValueAsString(Map.of("type", "NEW_MESSAGE", "message", msg))));
      }
    }
  }

  @Override
  public void afterConnectionClosed(
      @NonNull WebSocketSession session, @NonNull CloseStatus status) {
    activeSessions.values().removeIf(s -> s.getId().equals(session.getId()));
  }
}
