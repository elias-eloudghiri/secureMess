package com.securemessage.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
  CONVERSATION_NOT_FOUND(HttpStatus.NOT_FOUND, "Conversation not found"),
  USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
  INVALID_CONVERSATION_PARTICIPANTS(HttpStatus.BAD_REQUEST, "Invalid conversation participants"),
  UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Unauthorized"),
  INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"),
  PASSWORD_INCORRECT(HttpStatus.UNAUTHORIZED, "Incorrect password"),
  USER_NOT_FOUND_IN_PARTICIPANTS(
      HttpStatus.NOT_FOUND, "User not found in conversation participants");

  private final HttpStatus status;
  private final String defaultMessage;

  ErrorCode(HttpStatus status, String defaultMessage) {
    this.status = status;
    this.defaultMessage = defaultMessage;
  }
}
