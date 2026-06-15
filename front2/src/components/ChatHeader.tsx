import React from "react";
import { Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import { User } from "../types";
import { Avatar } from "./Avatar";
interface ChatHeaderProps {
  contact: User;
  onBack?: () => void;
}
export function ChatHeader({ contact, onBack }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none z-10 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
            aria-label="Retour à la liste des conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1 rounded-lg transition-colors min-w-0">
          <Avatar user={contact} size="sm" />
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
              {contact.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {contact.status}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Appel audio"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Appel vidéo"
        >
          <Video className="w-5 h-5" />
        </button>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Plus d'options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
