import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatPane } from "./components/ChatPane";
import { Auth } from "./components/Auth";
import { useScreenInit } from "./useScreenInit.js";
import { initialConversations, contacts, currentUser } from "./data/mock";
import { Conversation, User, Message } from "./types";
export function App() {
  const screenInit = useScreenInit();
  const [isAuthenticated, setIsAuthenticated] = useState(
    screenInit.isAuthenticated ?? false,
  );
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null;
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    // Mark as read when selected
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? {
              ...conv,
              unreadCount: 0,
            }
          : conv,
      ),
    );
  };
  const handleSendMessage = (text: string) => {
    if (!activeConversationId) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      senderId: currentUser.id,
      timestamp: new Date(),
      status: "sent",
    };
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      }),
    );
  };
  const handleStartNewChat = (contact: User) => {
    // Check if a conversation already exists with this contact
    const existingConv = conversations.find((c) =>
      c.participants.some((p) => p.id === contact.id),
    );
    if (existingConv) {
      handleSelectConversation(existingConv.id);
    } else {
      // Create a new empty conversation
      const newConv: Conversation = {
        id: `c_${Date.now()}`,
        participants: [contact],
        messages: [],
        unreadCount: 0,
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
    }
  };
  if (!isAuthenticated) {
    return (
      <Auth
        onLogin={() => setIsAuthenticated(true)}
        initialMode={screenInit.authMode}
      />
    );
  }
  return (
    <div className="flex w-full h-screen bg-gray-100 dark:bg-gray-950 overflow-hidden font-sans transition-colors">
      <div className="flex w-full h-full max-w-[1600px] mx-auto bg-white dark:bg-gray-900 shadow-2xl dark:shadow-black/50 overflow-hidden transition-colors">
        <div
          className={`${activeConversationId ? "hidden md:flex" : "flex"} w-full md:w-auto`}
        >
          <Sidebar
            conversations={conversations}
            contacts={contacts}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onStartNewChat={handleStartNewChat}
          />
        </div>
        <div
          className={`${activeConversationId ? "flex" : "hidden md:flex"} flex-1`}
        >
          <ChatPane
            conversation={activeConversation}
            currentUserId={currentUser.id}
            onSendMessage={handleSendMessage}
            onBack={() => setActiveConversationId(null)}
          />
        </div>
      </div>
    </div>
  );
}
