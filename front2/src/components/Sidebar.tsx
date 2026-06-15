import React, { useState } from "react";
import { Conversation, User } from "../types";
import { ConversationList } from "./ConversationList";
import { NewMessagePanel } from "./NewMessagePanel";
import { AnimatePresence } from "framer-motion";
interface SidebarProps {
  conversations: Conversation[];
  contacts: User[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onStartNewChat: (contact: User) => void;
}
export function Sidebar({
  conversations,
  contacts,
  activeConversationId,
  onSelectConversation,
  onStartNewChat,
}: SidebarProps) {
  const [isNewMessagePanelOpen, setIsNewMessagePanelOpen] = useState(false);
  const handleSelectContact = (contact: User) => {
    setIsNewMessagePanelOpen(false);
    onStartNewChat(contact);
  };
  return (
    <div className="w-full md:w-[360px] md:flex-shrink-0 md:border-r border-gray-200 dark:border-gray-800 h-full relative overflow-hidden bg-white dark:bg-gray-900 transition-colors">
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={onSelectConversation}
        onNewMessageClick={() => setIsNewMessagePanelOpen(true)}
      />

      <AnimatePresence>
        {isNewMessagePanelOpen && (
          <NewMessagePanel
            contacts={contacts}
            onClose={() => setIsNewMessagePanelOpen(false)}
            onSelectContact={handleSelectContact}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
