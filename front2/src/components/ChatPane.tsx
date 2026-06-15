import React from "react";
import { Conversation, User } from "../types";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { EmptyState } from "./EmptyState";
interface ChatPaneProps {
  conversation: Conversation | null;
  currentUserId: string;
  onSendMessage: (text: string) => void;
  onBack?: () => void;
}
export function ChatPane({
  conversation,
  currentUserId,
  onSendMessage,
  onBack,
}: ChatPaneProps) {
  if (!conversation) {
    return <EmptyState />;
  }
  // Assuming 1-on-1 chats for this UI, the contact is the first participant
  const contact = conversation.participants[0];
  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 relative transition-colors">
      <ChatHeader contact={contact} onBack={onBack} />
      <MessageList
        messages={conversation.messages}
        currentUserId={currentUserId}
      />

      <MessageComposer onSendMessage={onSendMessage} />
    </div>
  );
}
