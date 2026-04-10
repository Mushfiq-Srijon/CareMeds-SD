// @ts-nocheck
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [name, setName]                     = useState("");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole]                     = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!role) { alert("Please select a role"); return; }
    if (password !== confirmPassword) { alert("Passwords do not match"); return; }

    try {
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! Please check your email to verify your account.");
        navigate("/login");
      } else {
        alert("Registration Failed: " + (data.message || "Invalid input or already registered"));
      }
    } catch (error) {
      console.error("Server Error:", error);
      alert("Server Error");
    }
  };

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
    // FIX: minHeight instead of height so box doesn't get cut on small screens
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Register</h2>
        <form onSubmit={handleRegister}>

          {/* Name */}
          <div style={styles.inputGroup}>
            <input
              type="text" required value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input} placeholder=" "
            />
            <label style={{
              ...styles.label,
              top: name ? "-10px" : "50%",
              fontSize: name ? "12px" : "16px",
              color: name ? "#4da6ff" : "#e0e0e0",
            }}>Name</label>
          </div>

          {/* Email */}
          <div style={styles.inputGroup}>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input} placeholder=" "
            />
            <label style={{
              ...styles.label,
              top: email ? "-10px" : "50%",
              fontSize: email ? "12px" : "16px",
              color: email ? "#4da6ff" : "#e0e0e0",
            }}>Email</label>
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <input
              type={showPassword ? "text" : "password"} required value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...styles.input, paddingRight: "45px" }} placeholder=" "
            />
            <label style={{
              ...styles.label,
              top: password ? "-10px" : "50%",
              fontSize: password ? "12px" : "16px",
              color: password ? "#4da6ff" : "#e0e0e0",
            }}>Password</label>
            <span onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Confirm Password */}
          <div style={styles.inputGroup}>
            <input
              type={showConfirmPassword ? "text" : "password"} required value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ ...styles.input, paddingRight: "45px" }} placeholder=" "
            />
            <label style={{
              ...styles.label,
              top: confirmPassword ? "-10px" : "50%",
              fontSize: confirmPassword ? "12px" : "16px",
              color: confirmPassword ? "#4da6ff" : "#e0e0e0",
            }}>Confirm Password</label>
            <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              {showConfirmPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Role Selection — admin added */}
          <div style={{ marginBottom: "30px" }}>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.select}
            >
              <option value="">Select Role</option>
              <option value="customer">Customer</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="rider">Rider</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" style={styles.button}>Register</button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        <button onClick={handleGoogleLogin} style={styles.googleButton}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            style={{ width: "20px", marginRight: "10px" }}
          />
          Continue with Google
        </button>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.loginLink}>Login</Link>
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
    // FIX: was height:"100vh" which cuts the box — now minHeight + padding
    minHeight: "100vh",
    padding: "40px 16px",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    backdropFilter: "blur(15px)",
    borderRadius: "20px",
    padding: "50px 40px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
    textAlign: "center",
    // FIX: was width:"380px" which overflows on mobile — now width+maxWidth
    width: "100%",
    maxWidth: "420px",
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
    marginBottom: "20px",
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
    boxSizing: "border-box",
  },
  label: {
    position: "absolute",
    left: "15px",
    transform: "translateY(-50%)",
    transition: "0.2s ease all",
    pointerEvents: "none",
  },
  select: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    fontSize: "16px",
    color: "#333",
    boxSizing: "border-box",
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
    color: "#fff",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
    transition: "0.3s",
  },
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
  loginText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#b9dce8",
  },
  loginLink: {
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

export default Register;