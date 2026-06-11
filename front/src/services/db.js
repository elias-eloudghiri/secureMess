// src/services/db.js
import { openDB } from "idb";

const DB_NAME = "securemess-db";
const DB_VERSION = 1;

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store pour les clés Signal
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
      // Store pour les sessions Signal
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions");
      }
      // Store pour les messages déchiffrés
      if (!db.objectStoreNames.contains("messages")) {
        const store = db.createObjectStore("messages", { keyPath: "id" });
        store.createIndex("conversationId", "conversationId");
      }
    },
  });
}

export async function saveKeys(keys) {
  const db = await getDB();
  await db.put("keys", keys, "localKeys");
}

export async function loadKeys() {
  const db = await getDB();
  return db.get("keys", "localKeys");
}
