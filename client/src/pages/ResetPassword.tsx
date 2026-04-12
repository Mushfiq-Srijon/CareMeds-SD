import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import ApiClient from "../api";
import toast from "react-hot-toast";

const apiClient = new ApiClient();

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // These come from the URL: /reset-password?token=XXX&email=user@example.com
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // If token or email is missing from URL, show error immediately
  if (!token || !email) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Invalid Link</h2>
          <p style={{ color: "#c0d6f9" }}>
            This reset link is invalid or malformed.
          </p>
          <Link to="/forgot-password" style={styles.signupLink}>
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  const handleReset = async () => {
    if (!password || !confirmPassword) return toast.error("Please fill all fields");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      await apiClient.resetPassword(email, token, password);
      toast.success("Password reset successfully!");
      // Wait 1 second then redirect to login so user sees the success toast
      setTimeout(() => navigate("/login"), 1000);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Reset failed. Link may have expired.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={{ color: "#c0d6f9", marginBottom: "25px" }}>
          Enter your new password below.
        </p>

        {/* New Password */}
        <div style={styles.inputGroup}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...styles.input, paddingRight: "45px" }}
            placeholder=" "
          />
          <label
            style={{
              ...styles.label,
              top: password ? "-10px" : "50%",
              fontSize: password ? "12px" : "16px",
              color: password ? "#4da6ff" : "#e0e0e0",
            }}
          >
            New Password
          </label>
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* Confirm Password */}
        <div style={styles.inputGroup}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ ...styles.input, paddingRight: "45px" }}
            placeholder=" "
          />
          <label
            style={{
              ...styles.label,
              top: confirmPassword ? "-10px" : "50%",
              fontSize: confirmPassword ? "12px" : "16px",
              color: confirmPassword ? "#4da6ff" : "#e0e0e0",
            }}
          >
            Confirm Password
          </label>
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button
          onClick={handleReset}
          style={styles.button}
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p style={styles.signupText}>
          Remember your password?{" "}
          <Link to="/login" style={styles.signupLink}>
            Login
          </Link>
        </p>
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
  eyeIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "18px",
    userSelect: "none",
  },
};