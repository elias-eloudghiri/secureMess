package com.securemessage.backend.repository;

import com.securemessage.backend.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByReceiverIdAndDeliveredFalse(String receiverId);
}
