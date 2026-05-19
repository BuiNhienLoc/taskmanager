import React, { useEffect, useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../../firebase";
import { checkOwnerPhone } from "../../../api/authApi";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";

function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const normalizePhoneNumber = (value) => {
    return value.replace(/[^\d+]/g, "");
  };

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      return window.recaptchaVerifier;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      { size: "invisible" }
    );

    return window.recaptchaVerifier;
  };

  // Clean up the verifier when the component unmounts
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleSendCode = async (event) => {
    event.preventDefault();

    if (!phoneNumber) {
      setMessage("Please enter a phone number.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

      if (!normalizedPhoneNumber.startsWith("+")) {
        setMessage("Phone number must include country code, like +11234567890.");
        return;
      }

      await checkOwnerPhone(normalizedPhoneNumber);

      const appVerifier = setupRecaptcha();

      const result = await signInWithPhoneNumber(
        auth,
        normalizedPhoneNumber,
        appVerifier
      );

      setConfirmationResult(result);
      setPhoneNumber(normalizedPhoneNumber);
      setCodeSent(true);
      setMessage("Verification code sent. Please check your SMS.");
    } catch (error) {
      console.error("Send code error:", error);

      // Always reset the verifier after a failure so the next attempt works
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      if (error.response?.status === 403) {
        setMessage("This phone number is not registered as an active owner.");
      } else if (error.code === "auth/too-many-requests") {
        setMessage("Too many attempts. Please wait before trying again.");
      } else {
        setMessage(error.message || "Failed to send verification code.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();

    if (!accessCode) {
      setMessage("Please enter the verification code.");
      return;
    }

    if (!confirmationResult) {
      setMessage("Please request a verification code first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await confirmationResult.confirm(accessCode);

      const ownerSnap = await getDocs(
        query(
          collection(db, "users"),
          where("phoneNumber", "==", phoneNumber),
          where("role", "==", "owner")
        )
      );

      if (!ownerSnap.empty) {
        const ownerDoc = ownerSnap.docs[0];
        await updateDoc(doc(db, "users", ownerDoc.id), {
          isOnline: true,
          lastLoginAt: new Date(),
        });
      }

      // REMOVED: localStorage.setItem calls
      // Firebase Auth already maintains the session securely via its own
      // persistence layer — no localStorage flags needed.

      setMessage("Phone number verified successfully.");
      navigate("/owner/dashboard");
    } catch (error) {
      console.error("Verify code error:", error);
      setMessage("Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-login">
      <div id="recaptcha-container" style={{ display: "none" }}></div>

      <div className="login-contain">
        <div className="left-side">
          <div className="title">Welcome Back, Owner!</div>

          <h2>Please verify your phone number to access the system.</h2>

          {!codeSent ? (
            <form onSubmit={handleSendCode}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+11234567890"
              />
              <button type="submit" id="button_login" disabled={loading}>
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <label htmlFor="accessCode">Verification Code</label>
              <input
                type="text"
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter verification code"
                maxLength="6"
              />
              <button type="submit" id="button_login" disabled={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <button
                type="button"
                id="button_verify_code"
                disabled={loading}
                onClick={handleSendCode}
              >
                Resend Code
              </button>
            </form>
          )}

          {message && <p className="message-login">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;
