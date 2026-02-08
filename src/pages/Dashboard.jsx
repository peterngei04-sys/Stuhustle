// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [data, setData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setData(snap.data());
    };

    loadUserData();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="dashboard">
      {/* TOPBAR */}
      <header className="topbar">
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        <h2>StuHustle</h2>
      </header>

      {/* HAMBURGER MENU */}
      {menuOpen && (
        <aside className="menu">
          <section>
            <h4>Earning</h4>
            <button>Offerwalls</button>
            <button>Watch Ads</button>
            <button>Tasks</button>
            <button>Referrals</button>
          </section>

          <section>
            <h4>Wallet</h4>
            <button>Balance</button>
            <button>Withdraw</button>
            <button>Transaction History</button>
          </section>

          <section>
            <h4>Account</h4>
            <button>Profile</button>
            <button>Settings</button>
            <button>Support</button>
            <button className="logout" onClick={handleLogout}>Logout</button>
          </section>
        </aside>
      )}

      {/* MAIN DASHBOARD */}
      <main>
        <h3>Welcome back, {data?.username || "User"} 👋</h3>

        <div className="balance-card">
          <p>Available Balance</p>
          <h1>${data?.balanceUSD?.toFixed(2) || "0.00"}</h1>
          <span>Pending: ${data?.pendingUSD?.toFixed(2) || "0.00"}</span>
        </div>

        <div className="quick-actions">
          <button className="primary">Start Earning</button>
          <button className="secondary">Withdraw</button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
