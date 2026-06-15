import { User, Conversation } from "../types";

export const currentUser: User = {
  id: "me",
  name: "Moi",
  avatarColor: "bg-blue-500",
};

export const contacts: User[] = [
  {
    id: "1",
    name: "Alice Dupont",
    avatarColor: "bg-pink-500",
    status: "en ligne",
  },
  {
    id: "2",
    name: "Bob Martin",
    avatarColor: "bg-green-500",
    status: "vu il y a 5 min",
  },
  {
    id: "3",
    name: "Charlie Dubois",
    avatarColor: "bg-yellow-500",
    status: "en ligne",
  },
  {
    id: "4",
    name: "Diane Leroy",
    avatarColor: "bg-purple-500",
    status: "vu hier",
  },
  {
    id: "5",
    name: "Eve Moreau",
    avatarColor: "bg-indigo-500",
    status: "en ligne",
  },
  {
    id: "6",
    name: "Fabien Roux",
    avatarColor: "bg-red-500",
    status: "vu il y a 1h",
  },
  {
    id: "7",
    name: "Géraldine Blanc",
    avatarColor: "bg-teal-500",
    status: "en ligne",
  },
];

const now = Date.now();
const hour = 3600000;
const day = 86400000;

export const initialConversations: Conversation[] = [
  {
    id: "c1",
    participants: [contacts[0]],
    unreadCount: 2,
    messages: [
      {
        id: "m1",
        text: "Salut ! Tu vas bien ?",
        senderId: "1",
        timestamp: new Date(now - day * 2),
      },
      {
        id: "m2",
        text: "Oui super et toi ?",
        senderId: "me",
        timestamp: new Date(now - day * 2 + 10000),
        status: "read",
      },
      {
        id: "m3",
        text: "On se voit demain ?",
        senderId: "1",
        timestamp: new Date(now - hour),
      },
      {
        id: "m4",
        text: "A quelle heure ?",
        senderId: "1",
        timestamp: new Date(now - hour + 60000),
      },
    ],
  },
  {
    id: "c2",
    participants: [contacts[1]],
    unreadCount: 0,
    messages: [
      {
        id: "m5",
        text: "N'oublie pas la réunion de 14h.",
        senderId: "2",
        timestamp: new Date(now - day),
      },
      {
        id: "m6",
        text: "C'est noté, merci !",
        senderId: "me",
        timestamp: new Date(now - day + 50000),
        status: "read",
      },
    ],
  },
  {
    id: "c3",
    participants: [contacts[2]],
    unreadCount: 0,
    messages: [
      {
        id: "m7",
        text: "Tu as vu le dernier film ?",
        senderId: "3",
        timestamp: new Date(now - day * 5),
      },
      {
        id: "m8",
        text: "Non pas encore, pas de spoil !",
        senderId: "me",
        timestamp: new Date(now - day * 5 + 100000),
        status: "read",
      },
      {
        id: "m9",
        text: "Haha promis.",
        senderId: "3",
        timestamp: new Date(now - day * 5 + 200000),
      },
    ],
  },
  {
    id: "c4",
    participants: [contacts[3]],
    unreadCount: 1,
    messages: [
      {
        id: "m10",
        text: "Voici le document demandé.",
        senderId: "4",
        timestamp: new Date(now - day * 10),
      },
      {
        id: "m11",
        text: "Merci beaucoup !",
        senderId: "me",
        timestamp: new Date(now - day * 10 + 300000),
        status: "read",
      },
      {
        id: "m12",
        text: "De rien, bonne journée.",
        senderId: "4",
        timestamp: new Date(now - day * 10 + 360000),
      },
    ],
  },
];
