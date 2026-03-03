import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { setAuthenticatedUser } from "../store/userSlice";
import signalService from "../services/signalService";
import api from "../api";

const Register = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedUuid, setGeneratedUuid] = useState("");
  const [generatedKeys, setGeneratedKeys] = useState(null);
  const [generatedTokens, setGeneratedTokens] = useState(null);
  const dispatch = useDispatch();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (generatedUuid) {
      // User has already registered and is now proceeding to chat
      dispatch(
        setAuthenticatedUser({
          username: generatedUuid,
          keys: generatedKeys,
          accessToken: generatedTokens.accessToken,
          refreshToken: generatedTokens.refreshToken,
        }),
      );
      return;
    }

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
      const { uuid, accessToken, refreshToken } = response.data;

      // 4. Store state locally to display, don't dispatch immediately
      setGeneratedUuid(uuid);
      setGeneratedKeys(keys);
      setGeneratedTokens({ accessToken, refreshToken });
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
        {generatedUuid && (
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "green", fontWeight: "bold" }}>
              Registration Successful! Save your UUID:
            </label>
            <input
              type="text"
              readOnly
              value={generatedUuid}
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.25rem",
                background: "#e9ecef",
              }}
            />
          </div>
        )}
        <div style={{ marginBottom: "1rem" }}>
          <label>Choose a Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.5rem",
            background: generatedUuid ? "#28a745" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading
            ? "Processing..."
            : generatedUuid
              ? "Proceed to Chat"
              : "Register Anonymously"}
        </button>
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <Link
            to="/login"
            style={{ color: "#007bff", textDecoration: "none" }}
          >
            Already have an account? Login here.
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
