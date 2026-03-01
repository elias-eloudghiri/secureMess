import { KeyHelper } from "@privacyresearch/libsignal-protocol-typescript";

class SignalService {
  constructor() {
    this.directory = {}; // Mock store for now if needed locally
  }

  async generateIdentity(registrationId) {
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
    const identityKeyPair = await this.generateIdentity(registrationId);
    const preKeys = await this.generatePreKeys(0, 5); // Generate 5 prekeys
    const signedPreKey = await this.generateSignedPreKey(identityKeyPair, 1);

    return {
      registrationId,
      identityKeyPair,
      preKeys,
      signedPreKey,
    };
  }
}

export default new SignalService();
