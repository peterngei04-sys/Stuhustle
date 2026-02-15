import { useState } from "react";
import { auth } from "../firebase";
import { updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/security.css";

function Security() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChangePassword = async () => {
    if (!password) return;

    try {
      await updatePassword(auth.currentUser, password);
      setMessage("Password updated successfully.");
      setPassword("");
    } catch (err) {
      setMessage("Re-login required before changing password.");
    }
  };

  return (
    <div className="security">

      <header className="topbar">
        <button onClick={() => navigate("/profile")}>← Back</button>
        <h2>Security Settings</h2>
      </header>

      <div className="security-card">

        <h3>Change Password</h3>

        {message && <p className="message">{message}</p>}

        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleChangePassword}>
          Update Password
        </button>

      </div>
    </div>
  );
}

export default Security;
