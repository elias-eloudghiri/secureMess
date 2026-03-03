package com.securemessage.backend.repository;

import com.securemessage.backend.model.Conversation;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
  List<Conversation> findByParticipantsContainingOrderByLastMessageAtDesc(String userId);
}
