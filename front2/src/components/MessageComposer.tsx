import React, { useEffect, useState, useRef } from "react";
import { Paperclip, Smile, Send, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
interface MessageComposerProps {
  onSendMessage: (text: string) => void;
}
export function MessageComposer({ onSendMessage }: MessageComposerProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText("");
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.focus();
      }
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };
  return (
    <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors">
      <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-800 rounded-3xl p-1 pr-2 transition-colors">
        <button className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0">
          <Smile className="w-5 h-5" />
        </button>
        <button className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0">
          <Paperclip className="w-5 h-5" />
        </button>

        <textarea
          ref={inputRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message"
          className="flex-1 max-h-[120px] min-h-[40px] py-2.5 px-2 bg-transparent border-none focus:ring-0 resize-none text-[15px] leading-tight text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          rows={1}
        />

        <div className="flex-shrink-0 mb-0.5">
          <AnimatePresence mode="wait">
            {text.trim() ? (
              <motion.button
                key="send"
                initial={{
                  scale: 0.8,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  scale: 0.8,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.15,
                }}
                onClick={handleSend}
                className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-full transition-colors shadow-sm"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </motion.button>
            ) : (
              <motion.button
                key="mic"
                initial={{
                  scale: 0.8,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  scale: 0.8,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.15,
                }}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Mic className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
