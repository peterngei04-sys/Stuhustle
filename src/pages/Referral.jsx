import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  updateDoc
} from "firebase/firestore";
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
        // Load current user
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setData(snap.data());

        // Load users this user referred
        const q = query(collection(db, "users"), where("referredBy", "==", snap.data().referralCode));
        const refSnap = await getDocs(q);
        const list = refSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      // Find the referrer
      const q = query(collection(db, "users"), where("referralCode", "==", refCodeInput));
      const refSnap = await getDocs(q);

      if (refSnap.empty) {
        setMessage("Invalid referral code.");
        return;
      }

      const referrerDoc = refSnap.docs[0];
      const referrerData = referrerDoc.data();

      if (data.referredBy) {
        setMessage("You have already used a referral code.");
        return;
      }

      // Update current user referredBy
      await updateDoc(doc(db, "users", user.uid), {
        referredBy: refCodeInput,
        pointsApproved: (data.pointsApproved || 0) + 50 // reward points for using referral
      });

      // Update referrer points and referrals count
      await updateDoc(doc(db, "users", referrerDoc.id), {
        referrals: (referrerData.referrals || 0) + 1,
        pointsApproved: (referrerData.pointsApproved || 0) + 50,
      });

      // Record the referral claim
      await addDoc(collection(db, "referralClaims"), {
        referrerId: referrerDoc.id,
        referredId: user.uid,
        reward: 50,
        createdAt: Timestamp.now(),
      });

      // Refresh current user data
      const updatedSnap = await getDoc(doc(db, "users", user.uid));
      if (updatedSnap.exists()) setData(updatedSnap.data());
      setRefCodeInput("");
      setMessage("Referral claimed successfully!");

      // Refresh referrals list
      const q2 = query(collection(db, "users"), where("referredBy", "==", updatedSnap.data().referralCode));
      const newRefSnap = await getDocs(q2);
      const list = newRefSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReferralsList(list);

    } catch (err) {
      console.error(err);
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
            <button type="submit" className="primary" disabled={data.referredBy}>
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
