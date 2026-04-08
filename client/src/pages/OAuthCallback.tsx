// @ts-nocheck
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// This page is loaded when Google redirects the user back after login.
// The URL will contain: ?token=...&name=...&role=...&id=...
// We read those values, save them to localStorage, and redirect the user.

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Line 13: Read the token and user info from the URL
    const token = searchParams.get("token");
    const name  = searchParams.get("name");
    const role  = searchParams.get("role");
    const id    = searchParams.get("id");

    if (!token || !role) {
      // Line 19: If something is missing, send them back to login
      navigate("/login");
      return;
    }

    // Line 24: Save everything to localStorage exactly like normal login does
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_name", name || "");
    localStorage.setItem("user_role", role);
    localStorage.setItem("user_id", id || "");

    // Line 30: Redirect based on role
    if (role === "customer")  navigate("/home");
    else if (role === "pharmacy") navigate("/pharmacy");
    else if (role === "rider")    navigate("/rider");
    else navigate("/home");

  }, []);

  return (
    <div style={styles.container}>
      <p style={styles.text}>Signing you in with Google...</p>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
  },
  text: {
    color: "#fff",
    fontSize: "20px",
    fontFamily: "'Poppins', sans-serif",
  },
};

export default OAuthCallback;