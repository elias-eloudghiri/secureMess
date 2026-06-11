// src/services/secureStorage.js
import { openDB } from "idb";
import { decrypt, deriveKey, encrypt } from "./cryptoStorage";

const DB_NAME = "securemess-db";

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("secure")) {
        db.createObjectStore("secure");
      }
      if (!db.objectStoreNames.contains("messages")) {
        const store = db.createObjectStore("messages", { keyPath: "id" });
        store.createIndex("byConversation", "conversationId");
      }
    },
  });
}

/**
 * Sauvegarde les clés Signal chiffrées avec le mot de passe.
 * À appeler lors du register/login.
 */
export async function saveEncryptedKeys(keys, password) {
  // Générer un sel unique par utilisateur
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const encrypted = await encrypt(keys, key);

  const db = await getDB();
  await db.put("secure", { encrypted, salt: Array.from(salt) }, "signalKeys");
}

export async function loadEncryptedKeys(password) {
  const db = await getDB();
  const record = await db.get("secure", "signalKeys");
  if (!record) return null;

  const salt = new Uint8Array(record.salt);
  const key = await deriveKey(password, salt);
  return decrypt(record.encrypted, key);
}

export async function saveSession(address, sessionRecord) {
  const db = await getDB();
  await db.put("secure", sessionRecord, `session:${address}`);
}

export async function loadSession(address) {
  const db = await getDB();
  return db.get("secure", `session:${address}`);
}

export async function getAllSessionKeys() {
  const db = await getDB();
  const allKeys = await db.getAllKeys("secure");
  return allKeys
    .filter((k) => k.startsWith("session:"))
    .map((k) => k.replace("session:", ""));
}

export async function saveMessage(message) {
  // message = { id, conversationId, senderId, text, timestamp, status }
  const db = await getDB();
  await db.put("messages", message);
}

export async function loadMessages(conversationId) {
  const db = await getDB();
  return db.getAllFromIndex("messages", "byConversation", conversationId);
}

export async function clearMessages(conversationId) {
  const db = await getDB();
  const messages = await loadMessages(conversationId);
  const tx = db.transaction("messages", "readwrite");
  await Promise.all(messages.map((m) => tx.store.delete(m.id)));
  await tx.done;
}

// secureStorage.js — ajouter
export async function saveIdentityKey(identifier, publicKey) {
  const db = await getDB();
  await db.put(
    "secure",
    Array.from(new Uint8Array(publicKey)),
    `identity:${identifier}`
  );
}

export async function loadIdentityKey(identifier) {
  const db = await getDB();
  const stored = await db.get("secure", `identity:${identifier}`);
  return stored ? new Uint8Array(stored).buffer : null;
}
