import { useState } from "react";
import axios from "axios";
import "./Login.css"; 

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true); 
    try {
      const res = await axios.post("http://localhost:5002/api/auth/forgot-password", { email });
      setMessage(res.data.message);
      setEmail(""); 
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="login-container">
      <div className="login-section">
        <h2 className="welcome-text">Forgot Password</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>Enter your registered email:</label>
          <div className="input-wrapper">
            <input
              type="email"
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          {message && <p style={{ color: "green" }}>{message}</p>}
          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
