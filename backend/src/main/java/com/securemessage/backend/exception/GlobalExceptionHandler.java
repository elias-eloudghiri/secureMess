package com.securemessage.backend.exception;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(InvalidRegistrationException.class)
  public ResponseEntity<String> handleInvalidRegistration(InvalidRegistrationException e) {
    return ResponseEntity.badRequest().body(e.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ProblemDetail handleValidation(MethodArgumentNotValidException e) {
    ProblemDetail problemDetail =
        ProblemDetail.forStatusAndDetail(
            org.springframework.http.HttpStatus.BAD_REQUEST, "Validation failed");
    problemDetail.setTitle("Invalid Request Content");

    Map<String, String> errors = new HashMap<>();
    e.getBindingResult()
        .getFieldErrors()
        .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
    problemDetail.setProperty("errors", errors);

    return problemDetail;
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<String> handleGenericException(Exception e) {
    return ResponseEntity.internalServerError()
        .body("An unexpected error occurred: " + e.getMessage());
  }
}
