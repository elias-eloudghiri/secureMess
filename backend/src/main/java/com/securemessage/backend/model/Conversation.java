package com.securemessage.backend.model;

import java.util.Date;
import java.util.List;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "conversations")
public class Conversation {
  @Id private String id;
  private List<String> participants; // Array of 2 UUIDs
  private Date lastMessageAt;
  private String
      lastMessagePreview; // Optional, might be removed if purely E2E (or store purely encrypted)
}
