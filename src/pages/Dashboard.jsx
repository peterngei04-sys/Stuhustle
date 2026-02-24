import { useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import useUserData from "../hooks/useUserData";
import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { data, loading } = useUserData();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };
  const handleStartEarning = () => setMenuOpen(true);
  if (loading) return <div className="dashboard loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <header className="topbar">
        <button className="hamburger" onClick={toggleMenu}>☰</button>
        <h2>StuHustle</h2>
      </header>

      {menuOpen && <div className="menu-overlay" onClick={closeMenu} />}
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
          <button className="logout" onClick={() => navigate("/logout")}>
            Logout
          </button>
        </section>
      </aside>
      <main className="content">
        <h3>Welcome back, <span>{data.username}</span> 👋</h3>

        <div className="balance-card">
          <p>Available Balance</p>
          <h1>${data.balanceUSD.toFixed(2)}</h1>
          <span>Pending: ${data.pendingUSD.toFixed(2)}</span>
        </div>

        <div className="stats">
          <div className="stat">
            <h4>Total Earned</h4>
            <p>${data.totalEarnedUSD.toFixed(2)}</p>
          </div>

          <div className="stat">
            <h4>Referrals</h4>
            <p>{data.referrals}</p>
          </div>

          <div className="stat">
            <h4>Tasks Completed</h4>
            <p>{data.tasksCompleted}</p>
          </div>

          <div className="stat">
            <h4>Account Status</h4>
            <p className={data.accountStatus === "active" ? "active" : "danger"}>
              {data.accountStatus}
            </p>
          </div>

          <div className="stat">
            <h4>Pending Points</h4>
            <p>{data.pointsPending}</p>
          </div>

          <div className="stat">
            <h4>Approved Points</h4>
            <p>{data.pointsApproved}</p>
          </div>

          <div className="stat">
            <h4>Points Value</h4>
            <p>${(data.pointsApproved / 1000).toFixed(2)}</p>
          </div>
        </div>

        <div className="quick-actions">
          <button className="primary" onClick={handleStartEarning}>Start Earning</button>
          <button className="secondary">Withdraw Funds</button>
        </div>

        <section className="earnings-overview">
          <h4>Ways to Earn</h4>
          <div className="earning-grid">
            <div className="earning-card">Offerwalls</div>
            <div className="earning-card">Sponsored Campaigns</div>
            <div className="earning-card">Freelancing</div>
            <div className="earning-card">Affiliate Programs</div>
            <div className="earning-card">Paid Surveys</div>
            <div className="earning-card">Referrals</div>
            <div className="earning-card">Micro Tasks</div>
            <div className="earning-card">Skill-Based Gigs</div>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        © 2026 StuHustle · Powered by PECO Industries
      </footer>
    </div>
  );
}

export default Dashboard;
