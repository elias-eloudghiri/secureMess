import React, { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { User } from "../types";
import { Avatar } from "./Avatar";
import { motion } from "framer-motion";
interface NewMessagePanelProps {
  contacts: User[];
  onClose: () => void;
  onSelectContact: (contact: User) => void;
}
export function NewMessagePanel({
  contacts,
  onClose,
  onSelectContact,
}: NewMessagePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return (
    <motion.div
      initial={{
        x: "-100%",
      }}
      animate={{
        x: 0,
      }}
      exit={{
        x: "-100%",
      }}
      transition={{
        type: "spring",
        bounce: 0,
        duration: 0.3,
      }}
      className="absolute inset-0 bg-white dark:bg-gray-900 z-10 flex flex-col transition-colors"
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={onClose}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Nouveau message
        </h1>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border-none rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-colors"
            placeholder="À : nom ou numéro"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Contacts
        </div>
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            Aucun contact trouvé.
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
            >
              <Avatar user={contact} size="sm" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                  {contact.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {contact.status}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
}
