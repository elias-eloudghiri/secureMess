package com.securemessage.backend.repository;

import com.securemessage.backend.model.Message;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MessageRepository extends MongoRepository<Message, String> {
  List<Message> findByReceiverIdAndDeliveredFalse(String receiverId);

  List<Message> findByConversationIdOrderByTimestampAsc(String conversationId);
}
