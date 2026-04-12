import { useState } from "react";
import { Link } from "react-router-dom";
import ApiClient from "../api";
import toast from "react-hot-toast";

const apiClient = new ApiClient();

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
      await apiClient.forgotPassword(email);
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Forgot Password</h2>

        {submitted ? (
          <>
            <p style={{ color: "#c0d6f9", marginBottom: "20px" }}>
              If that email is registered, a reset link has been sent. Check your inbox.
            </p>
            <Link to="/login" style={styles.signupLink}>
              Back to Login
            </Link>
          </>
        ) : (
          <>
            <p style={{ color: "#c0d6f9", marginBottom: "20px" }}>
              Enter your registered email and we'll send you a password reset link.
            </p>

            <div style={styles.inputGroup}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder=" "
              />
              <label
                style={{
                  ...styles.label,
                  top: email ? "-10px" : "50%",
                  fontSize: email ? "12px" : "16px",
                  color: email ? "#4da6ff" : "#e0e0e0",
                }}
              >
                Email Address
              </label>
            </div>

            <button
              onClick={handleSubmit}
              style={styles.button}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p style={styles.signupText}>
              Remember your password?{" "}
              <Link to="/login" style={styles.signupLink}>
                Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    backdropFilter: "blur(15px)",
    borderRadius: "20px",
    padding: "50px 40px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
    textAlign: "center",
    width: "380px",
    color: "#fff",
  },
  title: {
    marginBottom: "30px",
    fontWeight: "700",
    fontSize: "28px",
    letterSpacing: "1px",
  },
  inputGroup: {
    position: "relative",
    marginBottom: "30px",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    background: "rgba(255,255,255,0.15)",
    border: "none",
    borderRadius: "10px",
    outline: "none",
    color: "#fff",
    fontSize: "16px",
  },
  label: {
    position: "absolute",
    left: "15px",
    transform: "translateY(-50%)",
    transition: "0.2s ease all",
    pointerEvents: "none",
  },
  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #3f0d90, #090909)",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    color: "#ffffff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },
  signupText: {
    marginTop: "25px",
    fontSize: "14px",
    color: "#c0d6f9",
  },
  signupLink: {
    color: "#4da6ff",
    fontWeight: "600",
    textDecoration: "none",
  },
};