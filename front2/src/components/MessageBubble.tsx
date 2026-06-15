import React from "react";
import { Check, CheckCheck } from "lucide-react";
import { Message } from "../types";
import { format } from "date-fns";
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}
export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const timeString = format(message.timestamp, "HH:mm");
  return (
    <div
      className={`flex w-full mb-2 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[75%] px-4 py-2 rounded-2xl transition-colors ${isOwn ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"}`}
      >
        <p className="text-[15px] leading-relaxed break-words">
          {message.text}
        </p>
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[11px] ${isOwn ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}
        >
          <span>{timeString}</span>
          {isOwn && (
            <span className="ml-0.5">
              {message.status === "read" ? (
                <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
              ) : message.status === "delivered" ? (
                <CheckCheck className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
