import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setAuthenticatedUser } from "../store/userSlice";
import signalService from "../services/signalService";
import api from "../api";

const Register = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Generate Signal Keys
      const keys = await signalService.generateKeysForRegistration();

      // 2. Prepare payload
      const payload = {
        password: password,
        identityKey: signalService.arrayBufferToBase64(
          keys.identityKeyPair.pubKey,
        ),
        signedPreKey: signalService.arrayBufferToBase64(
          keys.signedPreKey.keyPair.pubKey,
        ),
        signedPreKeyId: keys.signedPreKey.keyId,
        signedPreKeySignature: signalService.arrayBufferToBase64(
          keys.signedPreKey.signature,
        ),
        oneTimePreKeys: keys.preKeys.map((pk) => ({
          keyId: pk.keyId,
          publicKey: signalService.arrayBufferToBase64(pk.keyPair.pubKey),
        })),
      };

      // 3. Send to backend
      const response = await api.post("/auth/register", payload);
      const username = response.data;

      // 4. Store state
      dispatch(
        setAuthenticatedUser({
          username: username,
          keys: keys, // Store full key objects locally (sensitive!)
        }),
      );

      // Ideally save to indexedDB or localStorage here for persistence
    } catch (err) {
      console.error(err);
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "2rem auto",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Secure Registration</h2>
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Choose a Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.5rem",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {loading ? "Generating Keys..." : "Register Anonymously"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default Register;
