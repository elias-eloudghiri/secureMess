import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessageToConversation,
  fetchMessages,
  setActiveConversation,
  updateMessageStatus,
} from "../store/chatSlice";
import signalService from "../services/signalService";
import webSocketService from "../services/webSocketService";

import "./ChatWindow.css";
import api from "../api/index.js";
import { saveMessage } from "../services/secureStorage";

export default function ChatWindow() {
  const { uuid } = useParams(); // Recipient UUID
  const location = useLocation();
  const activeConversationId = location.state?.conversationId ?? uuid;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const messages = useSelector(
    (state) => state.chat.messagesByConversationId[activeConversationId] || []
  );

  const [text, setText] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  const loadLocalMessages = async () => {
    const local = await loadMessages(activeConversationId);
    if (local.length > 0) {
      // Hydrate Redux avec les messages locaux immédiatement
      local.forEach((msg) => {
        dispatch(
          addMessageToConversation({
            conversationId: activeConversationId,
            message: msg,
          })
        );
      });
    }
  };
  const initSession = async () => {
    if (!user.keys) {
      console.error("No local keys found. Cannot establish E2E session.");
      return;
    }

    try {
      const res = await api.get("/v1/signal/prekey-bundle/" + uuid);
      const bundle = res.data;

      await signalService.startSession(uuid, bundle);
      console.log("Session initialized, ready to send/receive messages.");
    } catch (err) {
      console.error("Failed to initialize session:", err);
    }
  };

  const handleIncomingMessage = async (data) => {
    console.log("[ChatWindow] Received WS message");
    if (data.type === "NEW_MESSAGE") {
      const msg = data.message;
      if (msg.senderId === uuid) {
        try {
          const decrypted = await signalService.decryptMessage(
            uuid,
            msg.encryptedContent
          );
          console.log("Message decrypted successfully:", { decrypted });
          const messageToStore = {
            id: msg.id,
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            text: decrypted,
            timestamp: msg.timestamp,
            status: "received",
          };

          await saveMessage(messageToStore);
          dispatch(
            addMessageToConversation({
              conversationId: msg.conversationId,
              message: messageToStore,
            })
          );
          console.log("Total messages :", { messages });
        } catch (err) {
          console.error("Failed to decrypt message:", err);
        }
      }
    }
  };

  const loadMessages = async () => {
    try {
      const result = await dispatch(
        fetchMessages(activeConversationId)
      ).unwrap();
      console.log("Messages chargés:", result);
    } catch (err) {
      console.error("Erreur fetchMessages:", err);
    }
  };
  useEffect(() => {
    dispatch(setActiveConversation(uuid));

    // Connect WebSocket
    webSocketService.connect(user.username);
    const unsubscribe = webSocketService.subscribe(handleIncomingMessage);

    try {
      // Fetch PreKeyBundle & Initialize Session
      if (sessionInitialized === false) {
        initSession().then(() => {
          setSessionInitialized(true);
          setSessionReady(true);
          loadLocalMessages().then(() => {
            console.log("Messages loaded successfully");
          });
        });
        //loadMessages().then(() => {});
      }
    } catch {
      return;
    }

    return () => {
      unsubscribe();
      webSocketService.disconnect();
    };
  }, [uuid]);

  const sendMessage = async () => {
    if (!text.trim() || !sessionReady) return;

    const temporaryId = `temp-${Date.now()}`;
    const messageText = text;

    await saveMessage({
      id: temporaryId,
      conversationId: activeConversationId,
      senderId: user.username,
      text: messageText,
      timestamp: new Date().toISOString(),
      status: "sending",
    });
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

      let sendMessagePayload = {
        senderId: user.username,
        receiverId: uuid,
        encryptedContent: encrypted,
        conversationId: activeConversationId, // Temporary front key until routes use real conversation ids
      };
      console.log({ sendMessagePayload });
      webSocketService.sendMessage(sendMessagePayload);
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
          onKeyUp={(e) => e.key === "Enter" && sendMessage()}
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
