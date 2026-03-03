import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  setActiveConversation,
  setActiveMessages,
  addMessage,
} from "../store/chatSlice";
import signalService from "../services/signalService";
import webSocketService from "../services/webSocketService";

import "./ChatWindow.css";

export default function ChatWindow() {
  const { uuid } = useParams(); // Recipient UUID
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const messages = useSelector((state) => state.chat.activeMessages);

  const [text, setText] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    dispatch(setActiveConversation(uuid));

    // Connect WebSocket
    webSocketService.connect(user.username);
    const unsubscribe = webSocketService.subscribe(handleIncomingMessage);

    // Fetch PreKeyBundle & Initialize Session
    initSession();

    return () => {
      unsubscribe();
      webSocketService.disconnect();
    };
  }, [uuid]);

  const initSession = async () => {
    if (!user.keys) {
      console.error("No local keys found. Please re-register.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/signal/prekey-bundle/${uuid}`,
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch bundle");
      const bundle = await res.json();
      await signalService.startSession(uuid, bundle);
      setSessionReady(true);

      // Load previous messages (would need decryption logic here for full history support)
      // For RNCP demo, we just focus on real-time messages.
    } catch (err) {
      console.error(err);
    }
  };

  const handleIncomingMessage = async (data) => {
    if (data.type === "NEW_MESSAGE") {
      const msg = data.message;
      if (msg.senderId === uuid) {
        try {
          const decrypted = await signalService.decryptMessage(
            uuid,
            msg.encryptedContent,
          );
          dispatch(
            addMessage({
              id: msg.id,
              senderId: msg.senderId,
              text: decrypted,
              timestamp: msg.timestamp,
            }),
          );
        } catch (err) {
          console.error("Failed to decrypt message:", err);
        }
      }
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !sessionReady) return;
    try {
      const encrypted = await signalService.encryptMessage(uuid, text);

      // Optimistic UI update
      dispatch(
        addMessage({
          id: Date.now().toString(),
          senderId: user.username,
          text,
          timestamp: new Date().toISOString(),
        }),
      );

      webSocketService.sendMessage({
        senderId: user.username,
        receiverId: uuid,
        encryptedContent: encrypted,
        conversationId: "temp", // Backend can generate or manage
      });

      setText("");
    } catch (err) {
      console.error("Failed to encrypt/send:", err);
    }
  };

  return (
    <div className="chat-window-container">
      <div className="chat-header">
        <button className="chat-back-btn" onClick={() => navigate("/chat")}>
          &larr; Back
        </button>
        <h3>Chat with {uuid.substring(0, 8)}...</h3>
      </div>

      <div className="chat-history">
        {!user.keys && (
          <p className="chat-status-text chat-error-text">
            Error: No local encryption keys found. Cannot establishment E2E
            session. Please register a new user on this device.
          </p>
        )}
        {!sessionReady && user.keys && (
          <p className="chat-status-text">Establishing secure session...</p>
        )}
        {messages.map((m, i) => {
          const isSent = m.senderId === user.username;
          return (
            <div
              key={i}
              className={`chat-message-row ${isSent ? "sent" : "received"}`}
            >
              <span
                className={`chat-message-bubble ${isSent ? "sent" : "received"}`}
              >
                {m.text}
              </span>
            </div>
          );
        })}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input-field"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a secure message..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          disabled={!sessionReady}
        />
        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={!sessionReady}
        >
          Send
        </button>
      </div>
    </div>
  );
}
