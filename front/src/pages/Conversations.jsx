import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/userSlice";

import "./Conversations.css";
import api from "../api/index.js";

export default function Conversations() {
  const user = useSelector((state) => state.user);
  const chat = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [newChatUuid, setNewChatUuid] = useState("");
  let conversations = [];

  useEffect(() => {
    // Fetch conversations
    api
      .get(`/v1/conversations/`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      .then((res) => {
        conversations = res.data;
      })
      // .then((data) => dispatch(setConversations(data)))
      .catch((err) => console.error(err));
  }, [dispatch, user]);

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
        <button onClick={handleLogout} className="conversations-logout-button">
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
        {conversations.length === 0 ? (
          <p>No conversations found. Start a new chat!</p>
        ) : (
          conversations.map((conv) => {
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
          })
        )}
      </ul>
    </div>
  );
}
