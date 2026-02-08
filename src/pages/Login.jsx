// src/pages/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import "../styles/signup.css"; // reuse same styles

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // ✅ Redirect to dashboard on success
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    }

    setLoading(false);
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!form.email) {
      return setError("Enter your email to reset password.");
    }

    try {
      await sendPasswordResetEmail(auth, form.email);
      setError("Password reset link sent to your email.");
    } catch (err) {
      setError("Failed to send password reset email.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Login</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <p
          style={{
            fontSize: "0.85rem",
            cursor: "pointer",
            color: "#00c6ff",
            textAlign: "right"
          }}
          onClick={handleForgotPassword}
        >
          Forgot password?
        </p>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="checkbox">
        By logging in you agree to our{" "}
        <Link to="/privacy">Privacy Policy</Link> &{" "}
        <Link to="/terms">Terms</Link>
      </p>

      <p className="link">
        Don’t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}

export default Login;
