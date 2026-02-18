import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserData from "../hooks/useUserData";
import "../styles/offerwalls.css"; // its own CSS file

function Offerwalls() {
  const navigate = useNavigate();
  const { data, loading } = useUserData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeWall, setActiveWall] = useState("adgate");

  if (loading) return <div className="offerwalls loading">Loading...</div>;

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const offerwalls = [
    {
      id: "adgate",
      name: "AdGate Media",
      url: "https://your-adgate-wall-link.com",
      description: "Complete surveys and tasks to earn instantly.",
    },
    {
      id: "offertoro",
      name: "Offertoro",
      url: "https://your-offertoro-wall-link.com",
      description: "Global offers with instant payouts for users.",
    },
    {
      id: "cpalead",
      name: "CPAlead",
      url: "https://your-cpalead-wall-link.com",
      description: "Mobile tasks and surveys for easy earnings.",
    },
  ];

  return (
    <div className="offerwalls-page">
      {/* Topbar */}
      <header className="topbar">
        <button className="hamburger" onClick={toggleMenu}>☰</button>
        <h2>StuHustle</h2>
      </header>

      {/* Overlay */}
      {menuOpen && <div className="menu-overlay" onClick={closeMenu} />}

      {/* Hamburger Menu */}
      <aside className={`menu ${menuOpen ? "open" : ""}`}>
        <section>
           <h4>Earning Methods</h4>
              <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="active">Offerwalls</button>
          <button>Paid Tasks</button>
          <button>Micro Jobs</button>
          <button>Affiliate Marketing</button>
          <button onClick={() => navigate("/referral")}>Referrals</button>
          <button>Freelancing Hub</button>
          <button>Skill Gigs</button>
           <button>Surveys</button>
          <button>Sponsored Campaigns</button>
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

      {/* Main Content */}
      <main className="content">
        <h3>Welcome back, <span>{data.username}</span> 👋</h3>

        <div className="balance-card">
          <p>Available Balance</p>
          <h1>${data.balanceUSD.toFixed(2)}</h1>
          <span>Pending: ${data.pendingUSD.toFixed(2)}</span>
        </div>

        <div className="offerwall-tabs">
          {offerwalls.map((wall) => (
            <button
              key={wall.id}
              className={activeWall === wall.id ? "active" : ""}
              onClick={() => setActiveWall(wall.id)}
            >
              {wall.name}
            </button>
          ))}
        </div>

        <div className="offerwall-content">
          {offerwalls.map((wall) => (
            <div
              key={wall.id}
              className={`wall-container ${
                activeWall === wall.id ? "visible" : "hidden"
              }`}
            >
              <h4>{wall.name}</h4>
              <p>{wall.description}</p>
              <iframe
                src={wall.url}
                title={wall.name}
                className="offerwall-iframe"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        © 2026 StuHustle · Powered by PECO Industries
      </footer>
    </div>
  );
}

export default Offerwalls;
