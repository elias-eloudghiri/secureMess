import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setConversations } from "../store/chatSlice";
import { logout } from "../store/userSlice";
import signalService from "../services/signalService";
import { SignalStore } from "../services/SignalStore";

import "./Conversations.css";

export default function Conversations() {
  const user = useSelector((state) => state.user);
  const chat = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [newChatUuid, setNewChatUuid] = useState("");

  useEffect(() => {
    // Fetch conversations
    fetch(`http://localhost:8080/api/v1/conversations/user/${user.username}`, {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => dispatch(setConversations(data)))
      .catch((err) => console.error(err));
  }, [user]);

  const startNewChat = () => {
    if (newChatUuid.trim()) {
      navigate(`/chat/${newChatUuid.trim()}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="conversations-container">
      <div className="conversations-header">
        <h2>My Conversations</h2>
        <button
          onClick={handleLogout}
          className="conversations-logout-button"
        >
          Logout
        </button>
      </div>
      <p>Logged in as: {user.username}</p>

      <div className="new-chat-form">
        <input
          type="text"
          className="new-chat-input"
          placeholder="Enter user UUID to start chat"
          value={newChatUuid}
          onChange={(e) => setNewChatUuid(e.target.value)}
        />
        <button className="new-chat-button" onClick={startNewChat}>
          Start Chat
        </button>
      </div>

      <ul className="conversations-list">
        {chat.conversations.map((conv) => {
          const otherParticipant = conv.participants.find(
            (p) => p !== user.username,
          );
          return (
            <li
              key={conv.id}
              className="conversation-item"
              onClick={() => navigate(`/chat/${otherParticipant}`)}
            >
              <strong>Chat with:</strong> {otherParticipant}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
