import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { setAuthenticatedUser } from "../store/userSlice";
import api from "../api";

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
      const response = await api.post(
        `/auth/login?uuid=${encodeURIComponent(uuid)}&password=${encodeURIComponent(password)}`,
      );

      const { uuid: returningUuid, accessToken, refreshToken } = response.data;
      if (accessToken) {
        // We login without local keys for now, as key retrieval/sync is WIP
        dispatch(
          setAuthenticatedUser({
            username: returningUuid,
            keys: null,
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
    <div
      style={{
        maxWidth: "400px",
        margin: "2rem auto",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "1rem" }}>
          <label>UUID (Username):</label>
          <input
            type="text"
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.5rem",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <Link
            to="/register"
            style={{ color: "#007bff", textDecoration: "none" }}
          >
            Need an account? Register here.
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
