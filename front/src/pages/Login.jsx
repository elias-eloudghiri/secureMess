import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { setAuthenticatedUser } from "../store/userSlice";
import api from "../api";
import "./Auth.css";

const Login = () => {
  const [uuid, setUuid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // The backend expects @RequestParam for uuid and password
      let request = {
        uuid: uuid,
        password: password,
      };
      const response = await api.post("/auth/login", request);

      const { uuid: returningUuid, accessToken, refreshToken } = response.data;
      if (accessToken) {
        // Retrieve existing keys if they exist in this browser
        const existingKeysStr = localStorage.getItem("keys");
        const existingKeys = existingKeysStr
          ? JSON.parse(existingKeysStr)
          : null;

        dispatch(
          setAuthenticatedUser({
            username: returningUuid,
            keys: existingKeys,
            accessToken,
            refreshToken,
          }),
        );
      } else {
        setError("Invalid UUID or password");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="auth-form-group">
          <label>UUID (Username):</label>
          <input
            type="text"
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        <div className="auth-form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="auth-button auth-button-success"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="auth-error">{error}</p>}

        <div className="auth-link-container">
          <Link to="/register" className="auth-link">
            Need an account? Register here.
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
