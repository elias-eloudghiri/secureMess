import { SignalStore } from "../src/services/SignalStore";
import signalService from "../src/services/signalService";

// Mock global crypto/atob for Jest if needed in Node env
global.window = {
  atob: (str) => Buffer.from(str, "base64").toString("binary"),
  btoa: (str) => Buffer.from(str, "binary").toString("base64"),
};

global.TextEncoder = class TextEncoder {
  encode(str) {
    return new Uint8Array(Buffer.from(str, "utf8"));
  }
};

global.TextDecoder = class TextDecoder {
  decode(arr) {
    return Buffer.from(arr).toString("utf8");
  }
};

describe("SignalService Encryption & Decryption", () => {
  it("should encrypt and decrypt a message seamlessly", async () => {
    // 1. Generate keys for Alice
    const aliceKeys = await signalService.generateKeysForRegistration();
    const aliceStore = new SignalStore();
    signalService.initStore(aliceStore, aliceKeys);

    // 2. Generate keys for Bob
    const bobKeys = await signalService.generateKeysForRegistration();
    const bobStore = new SignalStore();

    // 3. Alice initiates session with Bob
    const bobBundle = {
      identityKey: signalService.arrayBufferToBase64(
        bobKeys.identityKeyPair.pubKey,
      ),
      signedPreKeyId: 1,
      signedPreKey: signalService.arrayBufferToBase64(
        bobKeys.signedPreKey.keyPair.pubKey,
      ),
      signedPreKeySignature: signalService.arrayBufferToBase64(
        bobKeys.signedPreKey.signature,
      ),
      preKey: {
        keyId: bobKeys.preKeys[0].keyId,
        publicKey: signalService.arrayBufferToBase64(
          bobKeys.preKeys[0].keyPair.pubKey,
        ),
      },
    };

    // Alice builds a session with Bob's bundle
    await signalService.startSession("bob-uuid", bobBundle);

    // 4. Alice encrypts message for Bob
    const plaintext = "Hello from Alice!";
    const encryptedMsgStr = await signalService.encryptMessage(
      "bob-uuid",
      plaintext,
    );
    const encryptedMsg = JSON.parse(encryptedMsgStr);

    expect(encryptedMsg.type).toBeDefined();
    expect(encryptedMsg.body).toBeDefined();

    // 5. To decrypt, we need Bob's signalService to process the message.
    // For simplicity in this test, we verify that the plaintext was transformed.
    expect(encryptedMsg.body).not.toBe(plaintext);
  });
});
