export interface User {
  id: string;
  name: string;
  avatarColor: string;
  status?: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  unreadCount: number;
}
