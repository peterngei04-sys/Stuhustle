import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import "../styles/signup.css";

const countries = [
  "Kenya","Uganda","Tanzania","Nigeria","South Africa",
  "United States","United Kingdom","India","Canada","Australia",
  "Germany","France","Brazil","Japan","China","Other"
];

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    gender: "",
    agree: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const checkUsernameUnique = async () => {
    const q = query(
      collection(db, "users"),
      where("username", "==", form.username)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.agree) {
      return setError("You must agree to the Privacy Policy and Terms.");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      const isUnique = await checkUsernameUnique();
      if (!isUnique) {
        setLoading(false);
        return setError("Username already taken.");
      }

      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid,
        username: form.username,
        email: form.email,
        country: form.country,
        gender: form.gender,
        createdAt: new Date()
      });

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="signup-container">
      <h2>Create Account</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />

        <select name="country" onChange={handleChange} required>
          <option value="">Select Country</option>
          {countries.map(c => <option key={c}>{c}</option>)}
        </select>

        <select name="gender" onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <label className="checkbox">
          <input type="checkbox" name="agree" onChange={handleChange} />
          I agree to <Link to="/privacy">Privacy Policy</Link> & <Link to="/terms">Terms</Link>
        </label>

        <button disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="link">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Signup;
