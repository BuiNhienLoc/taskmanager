import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { setupEmployeeAccount } from "../../../api/employeeApi";
import "../Login/login.css"; 

function SetupAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = decodeURIComponent(searchParams.get("token") ?? "");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetup = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("Invalid setup link. Please request a new invite.");
      return;
    }

    try {
      setLoading(true);
      await setupEmployeeAccount({ token, username, password });
      setMessage("Account setup complete. Redirecting to login...");
      setTimeout(() => navigate("/employee/login"), 1500);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message;
      setMessage(msg || "Invalid, expired, or already-used setup link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-login">
      <div className="login-contain">
        <div className="left-side">
          <div className="title">Set Up Account</div>
          <h2>Create your employee login.</h2>

          <form onSubmit={handleSetup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" id="button_login" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          {message && (
            <p style={{
              marginTop: 16,
              color: message.includes("complete") ? "green" : "red"
            }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SetupAccount;
