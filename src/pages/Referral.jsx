import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/referrals.css";

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
      if (snap.exists()) setData(snap.data());
      setLoading(false);
    };

    loadUser();
  }, [user]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
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

    try {
      const token = await user.getIdToken();

      const res = await fetch("/api/referral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ referralCode: refCodeInput }),
      });

      const resData = await res.json();
      setMessage(resData.message);

      if (res.ok) {
        const updatedSnap = await getDoc(doc(db, "users", user.uid));
        if (updatedSnap.exists()) setData(updatedSnap.data());
        setRefCodeInput("");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Try again.");
    }
  };

  if (loading) return <div className="referral loading">Loading...</div>;
  if (!data) return <div className="referral error">Failed to load.</div>;

  return (
    <div className="referral">
      {/* TOPBAR */}
      <header className="topbar">
        <button className="hamburger" onClick={toggleMenu}>
          ☰
        </button>
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
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
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

        <div className="ref-card">
          <p>Total Referrals</p>
          <h1>{data.referralCount || 0}</h1>
        </div>

        <div className="ref-card">
          <p>Total Referral Earnings</p>
          <h1>{data.referralEarnings || 0} pts</h1>
        </div>

        <div className="claim-card">
          <h4>Use a Referral Code</h4>
          <form onSubmit={handleClaimReferral}>
            <input
              type="text"
              placeholder="Enter referral code"
              value={refCodeInput}
              onChange={(e) => setRefCodeInput(e.target.value)}
              disabled={data.referredBy}
            />
            <button type="submit" className="primary" disabled={data.referredBy}>
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
