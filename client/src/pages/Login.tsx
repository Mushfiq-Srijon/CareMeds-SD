// @ts-nocheck
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
        // Save token in localStorage
        localStorage.setItem("auth_token", data.token);

        if (data.user) {
          localStorage.setItem("user_name", data.user.name);
          localStorage.setItem("user_id", data.user.id);
          localStorage.setItem("user_role", data.user.role);
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
            <label
              style={{
                ...styles.label,
                top: email ? "-10px" : "50%",
                fontSize: email ? "12px" : "16px",
                color: email ? "#4da6ff" : "#e0e0e0",
              }}
            >
              Email
            </label>
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
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
              Password
            </label>
          </div>

          {/* Login Button */}
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        {/* Signup Link */}
        <p style={styles.signupText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.signupLink}>
            Sign Up
          </Link>
        </p>
        <p style={styles.signupText}>
          <Link to="/forgot-password" style={styles.signupLink}>
            Forgot Password?
          </Link>
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

export default Login;