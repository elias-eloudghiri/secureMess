import React, { useEffect, useRef } from "react";
import { Message } from "../types";
import { MessageBubble } from "./MessageBubble";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}
function getDateLabel(date: Date) {
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return "Hier";
  return format(date, "EEEE d MMMM", {
    locale: fr,
  });
}
export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  // Group messages by date
  const groupedMessages: {
    [key: string]: Message[];
  } = {};
  messages.forEach((msg) => {
    const dateKey = format(msg.timestamp, "yyyy-MM-dd");
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }
    groupedMessages[dateKey].push(msg);
  });
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 transition-colors">
      {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
        <div key={dateKey} className="mb-6">
          <div className="flex justify-center mb-4">
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium px-3 py-1 rounded-full transition-colors">
              {getDateLabel(new Date(dateKey))}
            </span>
          </div>
          {msgs.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUserId}
            />
          ))}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
