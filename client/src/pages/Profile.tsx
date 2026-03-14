import React, { useState, useEffect } from 'react';
import "../styles/Profile.css";

const Profile = () => {
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

  // Save Profile Logic
  const handleSaveProfile = () => {
    localStorage.setItem('user_name', editData.name);
    localStorage.setItem('user_phone', editData.phone);
    localStorage.setItem('user_address', editData.address);
    setUser({ ...editData });
    setIsEditing(false);
    setMessage("Profile updated successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  // Password Validation Logic
  const handleChangePassword = () => {
    if (passwords.new.length < 6) {
      alert("New password must be at least 6 characters!");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      alert("Passwords do not match!");
      return;
    }
    setMessage("Password changed successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
    setTimeout(() => setMessage(""), 3000);
  };

  // Logout Logic
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
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
        onChange={(e) => setEditData({...editData, name: e.target.value})} 
      />
    </div>

    <div className="edit-input-group">
      <label>PHONE</label>
      <input 
        type="text" placeholder="Enter phone number" 
        value={editData.phone} 
        onChange={(e) => setEditData({...editData, phone: e.target.value})} 
      />
    </div>

    <div className="edit-input-group">
      <label>ADDRESS</label>
      <textarea 
        placeholder="Enter your address" 
        value={editData.address} 
        onChange={(e) => setEditData({...editData, address: e.target.value})} 
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
                <input 
                  type="password" placeholder="Current Password" 
                  value={passwords.current} 
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})} 
                />
                <input 
                  type="password" placeholder="New Password" 
                  value={passwords.new} 
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})} 
                />
                <input 
                  type="password" placeholder="Confirm New Password" 
                  value={passwords.confirm} 
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} 
                />
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