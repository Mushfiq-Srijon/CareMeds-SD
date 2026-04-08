// @ts-nocheck
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// This page is shown to NEW Google users who have no role yet.
// The URL contains ?token=... (a temporary token).
// After they pick a role, we call the backend to save it,
// then save everything to localStorage and redirect them.

function SelectRole() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Line 15: Get the temporary token from the URL
  const tempToken = searchParams.get("token");

  const handleSubmit = async () => {
    if (!role) {
      alert("Please select a role to continue.");
      return;
    }

    if (!tempToken) {
      alert("Session expired. Please try logging in again.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      // Line 30: Send the chosen role to the backend
      // We use the temp token in the Authorization header
      const response = await fetch("http://localhost:8000/api/auth/google/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Line 42: Save the real token and user info to localStorage
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_name", data.user.name);
        localStorage.setItem("user_role", data.user.role);
        localStorage.setItem("user_id", data.user.id);

        // Line 48: Redirect based on chosen role
        if (data.user.role === "customer")       navigate("/home");
        else if (data.user.role === "pharmacy")  navigate("/pharmacy");
        else if (data.user.role === "rider")     navigate("/rider");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome to CareMeds!</h2>
        <p style={styles.subtitle}>Please select your role to continue.</p>

        {/* Role Selection Buttons */}
        <div style={styles.roleGroup}>
          {["customer", "pharmacy", "rider"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                ...styles.roleButton,
                background: role === r
                  ? "linear-gradient(135deg, #3f0d90, #090909)"
                  : "rgba(255,255,255,0.15)",
                border: role === r ? "2px solid #4da6ff" : "2px solid transparent",
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleSubmit}
          style={styles.confirmButton}
          disabled={loading}
        >
          {loading ? "Saving..." : "Continue"}
        </button>
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
    borderRadius: "20px",
    padding: "50px 40px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    textAlign: "center",
    width: "380px",
    color: "#fff",
  },
  title: {
    fontWeight: "700",
    fontSize: "26px",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#c0d6f9",
    fontSize: "14px",
    marginBottom: "30px",
  },
  roleGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "30px",
  },
  roleButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s",
  },
  confirmButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #3f0d90, #090909)",
    color: "#fff",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },
};

export default SelectRole;