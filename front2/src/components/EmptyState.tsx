import React from "react";
import { MessageCircle } from "lucide-react";
export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-full shadow-sm mb-4 transition-colors">
        <MessageCircle className="w-12 h-12 text-blue-500 dark:text-blue-400" />
      </div>
      <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
        SecureMess
      </h2>
      <p className="text-sm">
        Sélectionnez une conversation pour commencer à discuter
      </p>
    </div>
  );
}
