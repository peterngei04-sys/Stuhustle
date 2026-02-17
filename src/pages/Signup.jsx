import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import "../styles/signup.css";

// Full alphabetical list of countries
const countries = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
  "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain",
  "Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso",
  "Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic",
  "Chad","Chile","China","Colombia","Comoros","Congo (Congo-Brazzaville)","Costa Rica",
  "Croatia","Cuba","Cyprus","Czechia (Czech Republic)","Democratic Republic of the Congo",
  "Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador",
  "Equatorial Guinea","Eritrea","Estonia","Eswatini (fmr. Swaziland)","Ethiopia",
  "Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece",
  "Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Holy See","Honduras",
  "Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica",
  "Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia",
  "Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar",
  "Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius",
  "Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique",
  "Myanmar (formerly Burma)","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua",
  "Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau",
  "Palestine State","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland",
  "Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia",
  "Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia",
  "Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands",
  "Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname",
  "Sweden","Switzerland","Syria","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga",
  "Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan",
  "Vanuatu","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
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
    referralInput: "",
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorUsername, setErrorUsername] = useState("");
  const [errorConfirm, setErrorConfirm] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });

    if (name === "confirmPassword" || name === "password") {
      if (
        form.password &&
        (name === "confirmPassword" ? value : form.confirmPassword) !==
          (name === "password" ? value : form.password)
      ) {
        setErrorConfirm("Passwords do not match");
      } else {
        setErrorConfirm("");
      }
    }
  };

  const checkUsernameUnique = async () => {
    if (!form.username) return false;
    const q = query(collection(db, "users"), where("username", "==", form.username));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  const handleUsernameBlur = async () => {
    if (form.username) {
      const isUnique = await checkUsernameUnique();
      setErrorUsername(isUnique ? "" : "Username is not available");
    }
  };

  const checkReferralExists = async (code) => {
    if (!code) return null;
    const q = query(collection(db, "users"), where("referralCode", "==", code));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.agree) return setError("You must agree to the Privacy Policy and Terms.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (errorUsername) return setError("Please choose a different username.");

    setLoading(true);

    try {
      let referredByUid = null;

      // 🔒 Secure referral logic
      if (form.referralInput) {
        const refUser = await checkReferralExists(form.referralInput);

        if (!refUser) {
          setLoading(false);
          return setError("Referral code does not exist.");
        }

        if (refUser.data().username === form.username) {
          setLoading(false);
          return setError("You cannot use your own referral code.");
        }

        referredByUid = refUser.id;
      }

      // 🔑 Create new user
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const newReferralCode = form.username + "_" + userCred.user.uid.slice(0, 6);

      await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid,
        username: form.username,
        email: form.email,
        country: form.country,
        gender: form.gender,

        role: "user",
        status: "active",
        isBanned: false,
        banReason: null,

        balanceUSD: 0,
        pendingUSD: 0,
        totalEarnedUSD: 0,
        totalWithdrawnUSD: 0,

        pointsPending: 0,
        pointsApproved: 0,

        referrals: 0,
        tasksCompleted: 0,

        referralCode: newReferralCode,
        referredBy: referredByUid,
        referralVerified: !!referredByUid,
        referralQualified: false,
        referralRewardGiven: false,

        createdAt: new Date()
      });

      // 🔥 Reward referrer if referral code used
      if (referredByUid) {
        const referrerRef = doc(db, "users", referredByUid);
        await updateDoc(referrerRef, {
          pointsApproved: increment(10),
          referrals: increment(1),
        });

        // Record claim
        await setDoc(doc(collection(db, "referralClaims")), {
          referrerId: referredByUid,
          referredUserId: userCred.user.uid,
          reward: 10,
          createdAt: serverTimestamp()
        });
      }

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="signup-container">
      <h2>Create Account</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          onBlur={handleUsernameBlur}
          required
        />
        {errorUsername && <p className="inline-error">{errorUsername}</p>}

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

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        {errorConfirm && <p className="inline-error">{errorConfirm}</p>}

        <select name="country" value={form.country} onChange={handleChange} required>
          <option value="">Select Country</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select name="gender" value={form.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input
          name="referralInput"
          placeholder="Referral code (optional)"
          value={form.referralInput}
          onChange={handleChange}
        />

        <label className="checkbox">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
          />
          I agree to <Link to="/privacy">Privacy Policy</Link> &{" "}
          <Link to="/terms">Terms</Link>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="link">
        Already have an account? <Link to="/login">Login</Link>
      </p>

      <footer className="signup-footer">
        © 2026 StuHustle · Powered by PECO Industries
      </footer>
    </div>
  );
}

export default Signup;
