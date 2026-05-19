import React, { useEffect, useState } from 'react';
import './login.css';
import { useNavigate } from "react-router-dom";
import { auth, db, logInWithEmailAndPassword } from "../../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [user, authLoading] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;
        if (!user) return;

        const checkRole = async () => {
            const q = query(collection(db, "users"), where("uid", "==", user.uid));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const role = snap.docs[0].data().role;
                navigate(role === "owner" ? "/owner/dashboard" : "/employee/dashboard");
            }
        };

        checkRole();
    }, [user, authLoading]);

    const resolveEmail = async (identifier) => {
        if (identifier.includes("@")) return identifier;

        const q = query(
            collection(db, "users"),
            where("username", "==", identifier)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
            throw new Error("No account found with that username.");
        }

        return snap.docs[0].data().email;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!identifier || !password) {
            setError("Please enter your username/email and password.");
            return;
        }

        try {
            setLoading(true);
            const email = await resolveEmail(identifier.trim());
            await logInWithEmailAndPassword(email, password);
        } catch (err) {
            console.error(err);
            if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
                setError("Incorrect username/email or password.");
            } else {
                setError(err.message || "Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-login">
            <div className="login-contain">
                <div className="left-side">
                    <div className='title'>Welcome Back, Employee!</div>
                    <h2>Please sign in to use the system.</h2>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor="identifier">Username or Email</label>
                        <input
                            type="text"
                            id="identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Enter username or email"
                            autoComplete="username"
                        />

                        <label htmlFor="pass">Password</label>
                        <input
                            type="password"
                            id="pass"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            autoComplete="current-password"
                        />

                        {error && (
                            <p style={{ color: 'red', fontSize: 14, marginBottom: 8 }}>
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            id="button_login"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;