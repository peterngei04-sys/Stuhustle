import { useEffect, useState } from "react";
import { auth, db } from "../firebase";

import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

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
  const [referralsList, setReferralsList] = useState([]);

  // Load user data and referrals
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setData(snap.data());

        // ✅ FIXED: referredBy stores user.uid (not referralCode)
        const q = query(
          collection(db, "users"),
          where("referredBy", "==", user.uid)
        );

        const refSnap = await getDocs(q);
        const list = refSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReferralsList(list);

      } catch (err) {
        console.error("Failed to load referral data", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
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

  // ✅ FIXED: Now calls backend API instead of writing directly
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

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setMessage("You must be logged in.");
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/referral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          referralCode: refCodeInput,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Something went wrong.");
        return;
      }

      setMessage("Referral claimed successfully!");
      setRefCodeInput("");

      // Reload user data
      const updatedSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (updatedSnap.exists()) {
        setData(updatedSnap.data());
      }

      // Reload referrals list
      const q2 = query(
        collection(db, "users"),
        where("referredBy", "==", currentUser.uid)
      );

      const newRefSnap = await getDocs(q2);
      const list = newRefSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReferralsList(list);

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
        <button className="hamburger" onClick={toggleMenu}>☰</button>
        <h2>StuHustle</h2>
      </header>

      {menuOpen && <div className="menu-overlay" onClick={closeMenu} />}

      {/* SIDE MENU */}

        <aside className={`menu ${menuOpen ? "open" : ""}`}>
        <section>
          <h4>Dashboard</h4>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
        </section>
                                 
        <section>
          <h4>Earning Methods</h4>
          <button onClick={() => navigate("/offerwalls")}>Offerwalls</button>  
          <button onClick={() => navigate("/microtasks")}>Micro Tasks</button>
          <button onClick={() => navigate("/referral")}>Referrals</button>
          <button onClick={() => navigate("/featured")}>Featured Opportunities</button>
          <button onClick={() => navigate("/freelancing")}>Freelancing Hub</button>
        </section>
        <section>
          <h4>Wallet</h4>
          <button onClick={() => navigate("/wallet")}>Wallet</button>
        </section>

        <section>
          <h4>Account</h4>
          <button onClick={() => navigate("/profile")}>Profile</button>
          <button onClick={() => navigate("/security")}>Security</button>
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
          <button className="primary" onClick={copyCode}>Copy Code</button>
        </div>

        <div className="ref-card">
          <p>Total Referrals</p>
          <h1>{data.referrals || 0}</h1>
        </div>

        <div className="ref-card">
          <p>Total Referral Points</p>
          <h1>{data.pointsApproved || 0} pts</h1>
          <p>Points Value: ${(data.pointsApproved || 0) / 1000}</p>
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
            <button
              type="submit"
              className="primary"
              disabled={data.referredBy}
            >
              Submit
            </button>
          </form>
        </div>

        {message && <p className="message">{message}</p>}

        <div className="referrals-list">
          <h4>Users You Referred</h4>
          {referralsList.length > 0 ? (
            <ul>
              {referralsList.map(ref => (
                <li key={ref.id}>
                  <strong>{ref.username || ref.email}</strong> - {ref.pointsApproved || 0} pts
                </li>
              ))}
            </ul>
          ) : (
            <p>No referrals yet.</p>
          )}
        </div>
      </main>

      <footer className="dashboard-footer">
        © 2026 StuHustle · Powered by PECO Industries
      </footer>
    </div>
  );
}

export default Referral;
