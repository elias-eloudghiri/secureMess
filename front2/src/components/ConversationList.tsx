import React, { useState } from "react";
import { Search, SquarePen } from "lucide-react";
import { Conversation } from "../types";
import { Avatar } from "./Avatar";
import { format, isToday, isYesterday } from "date-fns";
import { ThemeToggle } from "./ThemeToggle";
import { fr } from "date-fns/locale";
interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewMessageClick: () => void;
}
function formatTime(date: Date) {
  if (isToday(date)) {
    return format(date, "HH:mm");
  }
  if (isYesterday(date)) {
    return "Hier";
  }
  return format(date, "dd MMM", {
    locale: fr,
  });
}
export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewMessageClick,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredConversations = conversations.filter((conv) => {
    const contact = conv.participants[0];
    const lastMessage = conv.messages[conv.messages.length - 1];
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      lastMessage?.text.toLowerCase().includes(searchLower)
    );
  });
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            SecureMess
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={onNewMessageClick}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Nouveau message"
          >
            <SquarePen className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border-none rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-colors"
            placeholder="Rechercher"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            Aucune conversation trouvée.
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const contact = conv.participants[0];
            const lastMessage = conv.messages[conv.messages.length - 1];
            const isActive = conv.id === activeConversationId;
            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full flex items-center gap-3 p-3 transition-colors text-left ${isActive ? "bg-blue-50 dark:bg-blue-950/30" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
              >
                <Avatar user={contact} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3
                      className={`text-base font-medium truncate ${isActive ? "text-gray-900 dark:text-white" : "text-gray-900 dark:text-gray-100"}`}
                    >
                      {contact.name}
                    </h3>
                    {lastMessage && (
                      <span
                        className={`text-xs flex-shrink-0 ml-2 ${conv.unreadCount > 0 ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {formatTime(lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p
                      className={`text-sm truncate ${conv.unreadCount > 0 ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {lastMessage?.text}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
