// @ts-nocheck
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Handles normal email/password login
  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Clear both storages first to avoid stale role conflicts
        localStorage.clear();
        sessionStorage.clear();

        if (rememberMe) {
          localStorage.setItem("auth_token", data.token);
          localStorage.setItem("user_name", data.user.name);
          localStorage.setItem("user_id", data.user.id);
          localStorage.setItem("user_role", data.user.role);
        } else {
          sessionStorage.setItem("auth_token", data.token);
          sessionStorage.setItem("user_name", data.user.name);
          sessionStorage.setItem("user_id", data.user.id);
          sessionStorage.setItem("user_role", data.user.role);
        }

        if (data.user.role === "customer") navigate("/home");
        else if (data.user.role === "pharmacy") navigate("/pharmacy");
        else if (data.user.role === "rider") navigate("/rider");
      } else {
        alert("Login Failed: " + (data.message || "Check credentials"));
      }
    } catch (error) {
      console.error("Server Error:", error);
      alert("Server Error");
    }
  };

  // Handles Google OAuth login
  const handleGoogleLogin = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/google");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Could not get Google login URL");
      }
    } catch (error) {
      alert("Server error. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleLogin}>

          {/* Email Input */}
          <div style={styles.inputGroup}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder=" "
            />
            <label style={{
              ...styles.label,
              top: email ? "-10px" : "50%",
              fontSize: email ? "12px" : "16px",
              color: email ? "#4da6ff" : "#e0e0e0",
            }}>
              Email
            </label>
          </div>

          {/* Password Input with eye icon (Sabikun) */}
          <div style={styles.inputGroup}>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...styles.input, paddingRight: "45px" }}
              placeholder=" "
            />
            <label style={{
              ...styles.label,
              top: password ? "-10px" : "50%",
              fontSize: password ? "12px" : "16px",
              color: password ? "#4da6ff" : "#e0e0e0",
            }}>
              Password
            </label>
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Remember Me checkbox (Oni) */}
          <div style={styles.rememberMeRow}>
            <label style={styles.rememberMeLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Remember Me</span>
            </label>
          </div>

          {/* Login Button */}
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        {/* Divider (Sabikun) */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Google Login Button (Sabikun) */}
        <button onClick={handleGoogleLogin} style={styles.googleButton}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            style={{ width: "20px", marginRight: "10px" }}
          />
          Continue with Google
        </button>

        {/* Signup Link */}
        <p style={styles.signupText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.signupLink}>Sign Up</Link>
        </p>
        <p style={styles.signupText}>
          <Link to="/forgot-password" style={styles.signupLink}>Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
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
    marginBottom: "40px",
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
    transition: "0.3s",
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
    transition: "0.3s",
    color: "#ffffff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },
  // Sabikun — divider between email login and Google login
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "20px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.3)",
  },
  dividerText: {
    margin: "0 10px",
    color: "#c0d6f9",
    fontSize: "13px",
  },
  // Sabikun — Google login button
  googleButton: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#333",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    marginBottom: "10px",
  },
  signupText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#c0d6f9",
  },
  signupLink: {
    color: "#4da6ff",
    fontWeight: "600",
    textDecoration: "none",
  },
  // Sabikun — eye icon for password visibility
  eyeIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "18px",
    userSelect: "none",
  },
  // Oni — Remember Me
  rememberMeRow: {
    marginBottom: "24px",
    textAlign: "left",
  },
  rememberMeLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#c0d6f9",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#4da6ff",
    cursor: "pointer",
  },
};

export default Login;