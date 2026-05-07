package com.securemessage.backend.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(Exception.class)
  public ResponseEntity<String> handleGenericException(Exception e) {
    log.error("An unexpected error occurred: ", e);
    return ResponseEntity.internalServerError()
        .body("An unexpected error occurred: " + e.getMessage());
  }

  @ExceptionHandler(UserException.class)
  public ResponseEntity<ProblemDetail> handleBusinessException(UserException exception) {
    ErrorCode errorCode = exception.getErrorCode();

    ProblemDetail problemDetail =
        ProblemDetail.forStatusAndDetail(errorCode.getStatus(), exception.getMessage());

    problemDetail.setTitle(errorCode.name());
    problemDetail.setProperty("code", errorCode.name());

    return ResponseEntity.status(errorCode.getStatus()).body(problemDetail);
  }
}
