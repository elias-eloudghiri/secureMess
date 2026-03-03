import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { setAuthenticatedUser } from "../store/userSlice";
import signalService from "../services/signalService";
import api from "../api";
import "./Auth.css";

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
        identityKey: keys.identityKeyPair.pubKey,
        signedPreKey: keys.signedPreKey.keyPair.pubKey,
        signedPreKeyId: keys.signedPreKey.keyId,
        signedPreKeySignature: keys.signedPreKey.signature,
        oneTimePreKeys: keys.preKeys.map((pk) => ({
          keyId: pk.keyId,
          publicKey: pk.keyPair.pubKey,
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
    <div className="auth-container">
      <h2>Secure Registration</h2>
      <form onSubmit={handleRegister}>
        {generatedUuid && (
          <div className="auth-form-group">
            <label className="auth-success-label">
              Registration Successful! Save your UUID:
            </label>
            <input
              type="text"
              readOnly
              value={generatedUuid}
              className="auth-input auth-input-readonly"
            />
          </div>
        )}
        <div className="auth-form-group">
          <label>Choose a Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="auth-input"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`auth-button ${generatedUuid ? 'auth-button-success' : 'auth-button-primary'}`}
        >
          {loading
            ? "Processing..."
            : generatedUuid
              ? "Proceed to Chat"
              : "Register Anonymously"}
        </button>
        {error && <p className="auth-error">{error}</p>}

        <div className="auth-link-container">
          <Link to="/login" className="auth-link">
            Already have an account? Login here.
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
