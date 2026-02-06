package com.securemessage.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "messages")
public class Message {
    @Id
    private String id;

    private String senderId; // UUID
    private String receiverId; // UUID

    private String encryptedContent; // Signal Message (Ciphertext) serialized
    private int type; // PreKeySignalMessage or SignalMessage

    private Date timestamp;

    private boolean delivered;
}
