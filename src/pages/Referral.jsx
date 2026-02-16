import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/referral.css";

function Referral() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [data, setData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [refCodeInput, setRefCodeInput] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadUser = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setData(snap.data());
      }
      setLoading(false);
    };

    loadUser();
  }, [user]);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(data.referralCode);
    setMessage("Referral code copied!");
  };

  const handleClaimReferral = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!refCodeInput) {
      setMessage("Enter a referral code.");
      return;
    }

    if (refCodeInput === data.referralCode) {
      setMessage("You cannot use your own referral code.");
      return;
    }

    const q = query(
      collection(db, "users"),
      where("referralCode", "==", refCodeInput)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      setMessage("Invalid referral code.");
      return;
    }

    const referrerId = snap.docs[0].id;

    await addDoc(collection(db, "referralClaims"), {
      referrerId,
      referredUserId: user.uid,
      createdAt: new Date(),
      verified: false
    });

    setMessage("Referral successfully submitted!");
    setRefCodeInput("");
  };

  if (loading) return <div className="referral loading">Loading...</div>;
  if (!data) return <div className="referral error">Failed to load.</div>;

  return (
    <div className="referral">

      {/* TOPBAR */}
      <header className="topbar">
        <button className="hamburger" onClick={toggleMenu}>☰</button>
        <h2>StuHustle</h2>
      </header>

      {menuOpen && <div className="menu-overlay" onClick={closeMenu} />}

      {/* SIDE MENU */}
      <aside className={`menu ${menuOpen ? "open" : ""}`}>
        <section>
          <h4>Earning Methods</h4>
          <button onClick={() => navigate("/referral")}>Referrals</button>
        </section>

        <section>
          <h4>Account</h4>
          <button onClick={() => navigate("/profile")}>Profile</button>
          <button onClick={() => navigate("/support")}>Support</button>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </section>
      </aside>

      {/* MAIN CONTENT */}
      <main className="content">

        <h3>Your Referral Program</h3>

        <div className="ref-card">
          <p>Your Referral Code</p>
          <h1>{data.referralCode}</h1>
          <button className="primary" onClick={copyCode}>
            Copy Code
          </button>
        </div>

        <div className="claim-card">
          <h4>Use a Referral Code</h4>
          <form onSubmit={handleClaimReferral}>
            <input
              type="text"
              placeholder="Enter referral code"
              value={refCodeInput}
              onChange={(e) => setRefCodeInput(e.target.value)}
            />
            <button type="submit" className="primary">
              Submit
            </button>
          </form>
        </div>

        {message && <p className="message">{message}</p>}

      </main>

      <footer className="dashboard-footer">
        © 2026 StuHustle · Powered by PECO Industries
      </footer>
    </div>
  );
}

export default Referral;
