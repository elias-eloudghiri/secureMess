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

    async isTrustedIdentity(identifier, identityKey, direction) {
        return true; // Trust on first use for RNCP
    }

    async saveIdentity(identifier, publicKey, nonblockingApproval) {
        this.store.identityKeys[identifier] = publicKey;
        return false;
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
        this.store.sessions[identifier] = record;
    }

    async loadSession(identifier) {
        return this.store.sessions[identifier];
    }
}
