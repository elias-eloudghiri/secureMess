import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessageToConversation,
  setActiveConversation,
  updateMessageStatus,
} from "../store/chatSlice";
import signalService from "../services/signalService";
import webSocketService from "../services/webSocketService";

import "./ChatWindow.css";

export default function ChatWindow() {
  const { uuid } = useParams(); // Recipient UUID
  const activeConversationId = uuid;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const messages = useSelector(
    (state) => state.chat.messagesByConversationId[activeConversationId] || []
  );

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
        }
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
            msg.encryptedContent
          );
          dispatch(
            addMessageToConversation({
              conversationId: activeConversationId,
              message: {
                id: msg.id,
                senderId: msg.senderId,
                text: decrypted,
                timestamp: msg.timestamp,
                status: "received",
              },
            })
          );
        } catch (err) {
          console.error("Failed to decrypt message:", err);
        }
      }
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !sessionReady) return;

    const temporaryId = `temp-${Date.now()}`;
    const messageText = text;

    dispatch(
      addMessageToConversation({
        conversationId: activeConversationId,
        message: {
          id: temporaryId,
          senderId: user.username,
          text: messageText,
          timestamp: new Date().toISOString(),
          status: "sending",
        },
      })
    );

    setText("");

    try {
      const encrypted = await signalService.encryptMessage(uuid, messageText);

      webSocketService.sendMessage({
        senderId: user.username,
        receiverId: uuid,
        encryptedContent: encrypted,
        conversationId: activeConversationId, // Temporary front key until routes use real conversation ids
      });
      dispatch(
        updateMessageStatus({
          conversationId: activeConversationId,
          messageId: temporaryId,
          status: "sent",
        })
      );
    } catch (err) {
      console.error("Failed to encrypt/send:", err);

      dispatch(
        updateMessageStatus({
          conversationId: activeConversationId,
          messageId: temporaryId,
          status: "failed",
        })
      );
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
        {messages === undefined ? (
          <p className="chat-status-text">Loading messages...</p>
        ) : (
          messages.map((m, i) => {
            const isSent = m.senderId === user.username;
            return (
              <div
                key={i}
                className={`chat-message-row ${isSent ? "sent" : "received"}`}>
                <div className="chat-message-content">
                  <span
                    className={`chat-message-bubble ${isSent ? "sent" : "received"}`}>
                    {m.text}
                  </span>

                  {isSent && m.status === "sending" && (
                    <span className="chat-message-status sending">
                      En cours d'envoi<span className="sending-dots">...</span>
                    </span>
                  )}

                  {isSent && m.status === "failed" && (
                    <span className="chat-message-status failed">
                      Echec de l'envoi
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
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
          disabled={!sessionReady}>
          Send
        </button>
      </div>
    </div>
  );
}
