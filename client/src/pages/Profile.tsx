import React, { useState } from 'react';
import ApiClient from '../api';
import "../styles/Profile.css";

const apiClient = new ApiClient();

const Profile = () => {
  const eyeStyle: React.CSSProperties = {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "18px",
    userSelect: "none",
  };
  // Frontend State Logic
  const [user, setUser] = useState({
    name: localStorage.getItem('user_name') || "",
    email: "customer@caremeds.com", // Mock email
    phone: localStorage.getItem('user_phone') || "Not added",
    address: localStorage.getItem('user_address') || "Not added",
    status: "Active"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...user });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [message, setMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidPhone = (value: string) => /^01\d{9}$/.test(value);

  // Save Profile Logic
  const handleSaveProfile = () => {
    if (editData.phone && !isValidPhone(editData.phone)) {
      alert("Please enter a valid phone number");
      return;
    }

    localStorage.setItem('user_name', editData.name);
    localStorage.setItem('user_phone', editData.phone);
    localStorage.setItem('user_address', editData.address);
    setUser({ ...editData });
    setIsEditing(false);
    setMessage("Profile updated successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  // Password Validation Logic
  const handleChangePassword = async () => {
    if (passwords.new.length < 6) {
      alert("New password must be at least 6 characters!");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      alert("Passwords do not match!");
      return;
    }
    if (!passwords.current) {
      alert("Please enter your current password!");
      return;
    }

    try {
      await apiClient.changePassword(passwords.current, passwords.new);
      setMessage("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to change password.";
      alert(msg);
    }
  };

  // Logout Logic
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="profile-root">
      <div className="profile-hero">
        <h1 className="profile-title">User <span>Profile</span></h1>
      </div>

      <div className="profile-container">
        {message && <div className="success-toast">{message}</div>}

        <div className="profile-grid">
          {/* 1. Profile Information Section */}
          <div className="card">
            <h3 className="section-heading">Account Information</h3>
            <div className="info-group">
              <label>Name</label>
              <p>{user.name || "No name added yet"}</p>
            </div>
            <div className="info-group">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            <div className="info-group">
              <label>Phone</label>
              <p>{user.phone}</p>
            </div>
            <div className="info-group">
              <label>Address</label>
              <p>{user.address}</p>
            </div>
            <div className="info-group">
              <label>Account Status</label>
              <span className="status-pill">{user.status}</span>
            </div>
            <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>

          {/* 2. Edit Profile & Password Section */}
          <div className="profile-right-col">
            {isEditing && (
              <div className="card edit-card">
                <h3 className="section-heading">Update Details</h3>

                <div className="edit-input-group">
                  <label>NAME</label>
                  <input
                    type="text" placeholder="Enter your name"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>

                <div className="edit-input-group">
                  <label>PHONE</label>
                  <input
                    type="text" placeholder="Enter phone number"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>

                <div className="edit-input-group">
                  <label>ADDRESS</label>
                  <textarea
                    placeholder="Enter your address"
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  />
                </div>

                <div className="btn-row">
                  <button className="btn btn-save" onClick={handleSaveProfile}>Save Changes</button>
                  <button className="btn btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            )}


            <div className="card">
              <h3 className="section-heading">Security</h3>
              <div className="password-fields">
                <div style={{ position: "relative" }}>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Current Password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    style={{ paddingRight: "40px", width: "100%" }}
                  />
                  <span
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={eyeStyle}
                  >
                    {showCurrentPassword ? "🙈" : "👁️"}
                  </span>
                </div>

                <div style={{ position: "relative" }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    style={{ paddingRight: "40px", width: "100%" }}
                  />
                  <span
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={eyeStyle}
                  >
                    {showNewPassword ? "🙈" : "👁️"}
                  </span>
                </div>

                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    style={{ paddingRight: "40px", width: "100%" }}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={eyeStyle}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </span>
                </div>

                <button className="btn btn-password" onClick={handleChangePassword}>Change Password</button>
              </div>
            </div>

            <button className="btn-logout" onClick={handleLogout}>Logout from CareMeds</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;