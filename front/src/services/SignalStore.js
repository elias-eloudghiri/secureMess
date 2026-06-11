import {
  loadIdentityKey,
  loadSession,
  saveIdentityKey,
  saveSession,
} from "./secureStorage";

export class SignalStore {
  constructor() {
    this.store = {
      identityKeys: {},
      sessions: {},
      preKeys: {},
      signedPreKeys: {},
      senderKeys: {},
    };
    this.ourIdentityKey = null;
    this.ourRegistrationId = null;

    // Bind all methods to ensure 'this' context is preserved when called by libsignal
    this.getIdentityKeyPair = this.getIdentityKeyPair.bind(this);
    this.getLocalRegistrationId = this.getLocalRegistrationId.bind(this);
    this.putOurIdentityKey = this.putOurIdentityKey.bind(this);
    this.putOurRegistrationId = this.putOurRegistrationId.bind(this);
    this.isTrustedIdentity = this.isTrustedIdentity.bind(this);
    this.saveIdentity = this.saveIdentity.bind(this);
    this.loadPreKey = this.loadPreKey.bind(this);
    this.storePreKey = this.storePreKey.bind(this);
    this.removePreKey = this.removePreKey.bind(this);
    this.loadSignedPreKey = this.loadSignedPreKey.bind(this);
    this.storeSignedPreKey = this.storeSignedPreKey.bind(this);
    this.removeSignedPreKey = this.removeSignedPreKey.bind(this);
    this.storeSession = this.storeSession.bind(this);
    this.loadSession = this.loadSession.bind(this);
  }

  // --- Identity & Registration ---
  async getIdentityKeyPair() {
    return this.ourIdentityKey;
  }

  async getLocalRegistrationId() {
    return this.ourRegistrationId;
  }

  async putOurIdentityKey(keyPair) {
    this.ourIdentityKey = keyPair;
  }

  async putOurRegistrationId(id) {
    this.ourRegistrationId = id;
  }

  // SignalStore.js — implémentation complète
  async isTrustedIdentity(identifier, identityKey, direction) {
    const trusted =
      this.store.identityKeys[identifier] ??
      (await loadIdentityKey(identifier)); // cherche en IndexedDB si pas en mémoire

    if (!trusted) return true; // TOFU

    const a = new Uint8Array(
      trusted instanceof ArrayBuffer ? trusted : (trusted.buffer ?? trusted)
    );
    const b = new Uint8Array(
      identityKey instanceof ArrayBuffer
        ? identityKey
        : (identityKey.buffer ?? identityKey)
    );

    return a.length === b.length && a.every((byte, i) => byte === b[i]);
  }

  async saveIdentity(identifier, publicKey) {
    const existing = this.store.identityKeys[identifier];
    this.store.identityKeys[identifier] = publicKey;
    await saveIdentityKey(identifier, publicKey); // persiste en IndexedDB

    if (!existing) return false;

    const a = new Uint8Array(
      existing instanceof ArrayBuffer ? existing : (existing.buffer ?? existing)
    );
    const b = new Uint8Array(
      publicKey instanceof ArrayBuffer
        ? publicKey
        : (publicKey.buffer ?? publicKey)
    );

    const changed =
      a.length !== b.length || !a.every((byte, i) => byte === b[i]);

    if (changed) {
      // Ici vous pourrez plus tard afficher une alerte à l'utilisateur
      console.warn(`⚠️ Clé d'identité changée pour ${identifier}`);
    }

    return changed;
  }

  // --- PreKeys ---
  async loadPreKey(keyId) {
    return this.store.preKeys[keyId];
  }

  async storePreKey(keyId, keyPair) {
    this.store.preKeys[keyId] = keyPair;
  }

  async removePreKey(keyId) {
    delete this.store.preKeys[keyId];
  }

  // --- Signed PreKeys ---
  async loadSignedPreKey(keyId) {
    return this.store.signedPreKeys[keyId];
  }

  async storeSignedPreKey(keyId, keyPair) {
    this.store.signedPreKeys[keyId] = keyPair;
  }

  async removeSignedPreKey(keyId) {
    delete this.store.signedPreKeys[keyId];
  }

  // --- Sessions ---
  async storeSession(identifier, record) {
    // Persiste dans les deux : mémoire (rapide) + IndexedDB (survit au refresh)
    this.store.sessions[identifier] = record;
    await saveSession(identifier, record);
  }

  async loadSession(identifier) {
    // Cherche en mémoire d'abord, sinon IndexedDB
    if (this.store.sessions[identifier]) {
      return this.store.sessions[identifier];
    }
    const persisted = await loadSession(identifier);
    if (persisted) {
      this.store.sessions[identifier] = persisted; // re-hydrate le cache mémoire
    }
    return persisted;
  }
}
