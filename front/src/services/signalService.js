import { KeyHelper } from "@privacyresearch/libsignal-protocol-typescript";

class SignalService {
  constructor() {
    this.directory = {}; // Mock store for now if needed locally
  }

  async generateIdentity() {
    return await KeyHelper.generateIdentityKeyPair();
  }

  async generateRegistrationId() {
    return await KeyHelper.generateRegistrationId();
  }

  async generatePreKeys(start, count) {
    const preKeys = [];
    for (let i = 0; i < count; i++) {
      const preKey = await KeyHelper.generatePreKey(start + i);
      preKeys.push(preKey);
    }
    return preKeys;
  }

  async generateSignedPreKey(identityKeyPair, signedPreKeyId) {
    return await KeyHelper.generateSignedPreKey(
      identityKeyPair,
      signedPreKeyId,
    );
  }

  // Helper to convert ArrayBuffer to Base64 for transport
  arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Generate all keys for registration
  async generateKeysForRegistration() {
    const registrationId = await this.generateRegistrationId();
    const identityKeyPair = await this.generateIdentity();
    const preKeys = await this.generatePreKeys(0, 5); // Generate 5 prekeys
    const signedPreKey = await this.generateSignedPreKey(identityKeyPair, 1);

    return {
      registrationId,
      identityKeyPair: {
        pubKey: this.arrayBufferToBase64(identityKeyPair.pubKey),
        privKey: this.arrayBufferToBase64(identityKeyPair.privKey),
      },
      preKeys: preKeys.map((pk) => ({
        keyId: pk.keyId,
        keyPair: {
          pubKey: this.arrayBufferToBase64(pk.keyPair.pubKey),
          privKey: this.arrayBufferToBase64(pk.keyPair.privKey),
        },
      })),
      signedPreKey: {
        keyId: signedPreKey.keyId,
        signature: this.arrayBufferToBase64(signedPreKey.signature),
        keyPair: {
          pubKey: this.arrayBufferToBase64(signedPreKey.keyPair.pubKey),
          privKey: this.arrayBufferToBase64(signedPreKey.keyPair.privKey),
        },
      },
    };
  }

  // --- Epic 2 Methods --- //

  initStore(store, localKeys) {
    this.store = store;
    if (localKeys && localKeys.identityKeyPair) {
      // Local keys from Redux/localStorage are plain objects with Base64 strings (or ArrayBuffers if fresh)
      // We must ensure they are converted to ArrayBuffers before going into the Store
      const pubKey =
        typeof localKeys.identityKeyPair.pubKey === "string"
          ? this.base64ToArrayBuffer(localKeys.identityKeyPair.pubKey)
          : localKeys.identityKeyPair.pubKey;

      const privKey =
        typeof localKeys.identityKeyPair.privKey === "string"
          ? this.base64ToArrayBuffer(localKeys.identityKeyPair.privKey)
          : localKeys.identityKeyPair.privKey;

      this.store.putOurIdentityKey({ pubKey, privKey });
      this.store.putOurRegistrationId(localKeys.registrationId);
    }
  }

  async startSession(recipientUUID, bundle) {
    const { SignalProtocolAddress, SessionBuilder } =
      await import("@privacyresearch/libsignal-protocol-typescript");
    const address = new SignalProtocolAddress(recipientUUID, 1);
    const sessionBuilder = new SessionBuilder(this.store, address);

    console.log({ bundle });

    const deviceBundle = {
      identityKey: this.base64ToArrayBuffer(bundle.identityKey),
      signedPreKey: {
        keyId: bundle.signedPreKeyId,
        publicKey: this.base64ToArrayBuffer(bundle.signedPreKey),
        signature: this.base64ToArrayBuffer(bundle.signedPreKeySignature),
      },
      preKey: bundle.preKey
        ? {
            keyId: bundle.preKey.keyId,
            publicKey: this.base64ToArrayBuffer(bundle.preKey.publicKey),
          }
        : undefined,
      registrationId: 1,
    };

    await sessionBuilder.processPreKey(deviceBundle);
  }

  async encryptMessage(recipientUUID, plaintext) {
    const { SignalProtocolAddress, SessionCipher } =
      await import("@privacyresearch/libsignal-protocol-typescript");
    const address = new SignalProtocolAddress(recipientUUID, 1);
    const sessionCipher = new SessionCipher(this.store, address);

    const enc = new TextEncoder();
    const plaintextBuffer = enc.encode(plaintext);

    const ciphertext = await sessionCipher.encrypt(plaintextBuffer.buffer);
    return JSON.stringify({
      type: ciphertext.type,
      body: ciphertext.body,
      registrationId: ciphertext.registrationId,
    });
  }

  async decryptMessage(senderUUID, ciphertextStr) {
    const { SignalProtocolAddress, SessionCipher } =
      await import("@privacyresearch/libsignal-protocol-typescript");
    const address = new SignalProtocolAddress(senderUUID, 1);
    const sessionCipher = new SessionCipher(this.store, address);

    const ciphertext = JSON.parse(ciphertextStr);

    let plaintextBuffer;
    if (ciphertext.type === 3) {
      plaintextBuffer = await sessionCipher.decryptPreKeyWhisperMessage(
        ciphertext.body,
        "binary",
      );
    } else {
      plaintextBuffer = await sessionCipher.decryptWhisperMessage(
        ciphertext.body,
        "binary",
      );
    }

    const dec = new TextDecoder();
    return dec.decode(plaintextBuffer);
  }

  base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export default new SignalService();
