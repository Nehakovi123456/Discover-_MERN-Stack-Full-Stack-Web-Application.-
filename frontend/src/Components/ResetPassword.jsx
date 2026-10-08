import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css"; 

const ResetPassword = () => {
  const { token } = useParams(); 
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      console.log("Reset token from URL:", token);
      const res = await axios.post(
        `http://localhost:5002/api/auth/reset-password/${token}`,
        { newPassword }
      );

      console.log("Server response:", res.data);
      setMessage(res.data.message);

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Reset error:", err.response?.data);
      setError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    }
  };


  return (
    <div className="login-container">
      <div className="login-section">
        <h2 className="welcome-text">Reset Password</h2>
        <form className="login-form" onSubmit={handleReset}>
          <label>New Password:</label>
          <input
            type="password"
            className="input-box"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Enter new password"
          />

          <label>Confirm Password:</label>
          <input
            type="password"
            className="input-box"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm new password"
          />

          {message && <p style={{ color: "green" }}>{message}</p>}
          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-button">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
