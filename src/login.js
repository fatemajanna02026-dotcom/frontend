import React, { useState } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "./login.css";

function Login({ setUser }) {
  const [activeSection, setActiveSection] = useState("login"); // 'login' বা 'register'
  const [showForgot, setShowForgot] = useState(false);
  const [step, setStep] = useState(1);

  const API_BASE = (
    process.env.REACT_APP_API_URL).replace(/\/$/, "");

  // ফর্ম ডাটা
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState(""); // ইমেইল বা ফোন
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const auth = getAuth();

  // ---------- ভ্যালিডেশন ফাংশন ----------
  const validateName = (name) => {
    return name.trim().length > 0;
  };

  const validateIdentifier = (id) => {
    if (id.includes("@")) {
      // ইমেইল – যেকোনো ইমেইল গ্রহণ (শুধু @ থাকলেই হবে)
      return true;
    } else {
      // ফোন নম্বর – ঠিক ১১ ডিজিট এবং সব সংখ্যা
      const phoneRegex = /^\d{11}$/;
      return phoneRegex.test(id);
    }
  };

  const validatePassword = (pwd) => {
    return pwd.length >= 6;
  };

  // ---------- ইমেইল/ফোন লগইন ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return alert("Please fill all fields!");

    // ভ্যালিডেশন: ফোন নম্বর ঠিক ১১ ডিজিট নাকি ইমেইল ঠিক আছে?
    if (!validateIdentifier(identifier)) {
      if (identifier.includes("@")) {
        return alert("Invalid email format.");
      } else {
        return alert("Phone number must be exactly 11 digits.");
      }
    }

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, password }), // identifier ইমেইল বা ফোন
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server connection error!");
    }
  };

  // ---------- রেজিস্ট্রেশন ----------
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !identifier || !password || !confirmPassword) {
      return alert("Please fill all fields!");
    }

    // নাম ভ্যালিডেশন
    if (!validateName(name)) {
      return alert("Name cannot be empty.");
    }

    // আইডি (ইমেইল/ফোন) ভ্যালিডেশন
    if (!validateIdentifier(identifier)) {
      if (identifier.includes("@")) {
        return alert("Invalid email format.");
      } else {
        return alert("Phone number must be exactly 11 digits.");
      }
    }

    // পাসওয়ার্ড ভ্যালিডেশন
    if (!validatePassword(password)) {
      return alert("Password must be at least 6 characters.");
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match!");
    }

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: identifier, password }), // identifier ইমেইল বা ফোন
      });
      const data = await res.json();
      if (data.success) {
        alert("Registration successful! Please login.");
        setActiveSection("login");
        setName("");
        setIdentifier("");
        setPassword("");
        setConfirmPassword("");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server connection error!");
    }
  };

  // ---------- ফরগট পাসওয়ার্ড (শুধু ইমেইল) ----------
  const handleSendOTP = async () => {
    if (!identifier) return alert("Please enter your email!");
    // ফরগট পাসওয়ার্ড শুধু ইমেইলের জন্য
    if (!identifier.includes("@")) {
      return alert("Only email is allowed for password reset!");
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setStep(2);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server error!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) return alert("Fill all fields!");
    if (!validatePassword(newPassword)) {
      return alert("New password must be at least 6 characters.");
    }
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, otp, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowForgot(false);
        setStep(1);
        setOtp("");
        setNewPassword("");
        setIdentifier("");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Network issue!");
    }
  };

  // ---------- গুগল লগইন ----------
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const res = await fetch(`${API_BASE}/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, name: user.displayName }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      } else {
        alert("Google login failed!");
      }
    } catch (error) {
      console.error(error);
      alert("Google sign-in failed!");
    }
  };

  // ---------- ফরগট পাসওয়ার্ড ফর্ম ----------
  if (showForgot) {
    return (
      <div className="login-container">
        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
          Reset Password
        </h3>
        {step === 1 ? (
          <>
            <input
              type="text"
              placeholder="Enter your email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="auth-input"
            />
            <button
              onClick={handleSendOTP}
              disabled={isLoading}
              className="auth-btn"
              style={{ background: isLoading ? "#bdc3c7" : "#f39c12" }}
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="auth-input"
            />
            <input
              type="password"
              placeholder="New Password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="auth-input"
            />
            <button
              onClick={handleResetPassword}
              className="auth-btn"
              style={{ background: "#2ecc71" }}
            >
              Reset Password
            </button>
          </>
        )}
        <p
          onClick={() => {
            setShowForgot(false);
            setStep(1);
            setIdentifier("");
          }}
          className="auth-link"
        >
          Back to Login
        </p>
      </div>
    );
  }

  // ---------- মূল লগইন/রেজিস্ট্রেশন UI ----------
  return (
    <div className="login-container">
      <div className="auth-tabs">
        <button
          onClick={() => setActiveSection("login")}
          className={`auth-tab ${activeSection === "login" ? "active" : ""}`}
        >
          Login
        </button>
        <button
          onClick={() => setActiveSection("register")}
          className={`auth-tab ${activeSection === "register" ? "active" : ""}`}
        >
          Register
        </button>
      </div>

      {activeSection === "login" && (
        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="text"
            placeholder="Email or 11-digit Phone Number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          <button type="submit" className="auth-btn">
            Login
          </button>
          <p
            onClick={() => setShowForgot(true)}
            className="auth-link forgot-link"
          >
            Forgot Password? (Email only)
          </p>
        </form>
      )}

      {activeSection === "register" && (
        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="text"
            placeholder="Email or 11-digit Phone Number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="auth-input"
          />
          <button
            type="submit"
            className="auth-btn"
            style={{ background: "#2ecc71" }}
          >
            Register
          </button>
        </form>
      )}

      <div className="google-login">
        <div className="divider">
          <span>OR</span>
        </div>
        <button onClick={handleGoogleLogin} className="google-btn">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
