import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserData from "../hooks/useUserData";
import "../styles/offerwalls.css";
import bitlabsLogo from "../assets/bitlabs.png";
import ayetLogo from "../assets/ayet.png";

function Offerwalls() {
  const navigate = useNavigate();
  const { data, loading } = useUserData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeWall, setActiveWall] = useState("bitlabs");

  if (loading) return <div className="offerwalls loading">Loading...</div>;
  if (!data) return <div className="offerwalls">User not found</div>;

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const offerwalls = [
    {
      id: "bitlabs",
      name: "BitLabs",
      logo: bitlabsLogo,
      url: `https://api.bitlabs.ai/v1/wall?token=YOUR_BITLABS_TOKEN&user_id=${data.uid}`,
      description: "Complete surveys and offers to earn instantly.",
    },
    {
      id: "ayet",
      name: "ayeT Studios",
      logo: ayetLogo,
      url: `https://www.ayetstudios.com/offers/web_offerwall/YOUR_PUBLISHER_ID?external_identifier=${data.uid}`,
      description: "High paying app installs and CPA offers.",
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
      {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}

      {/* Sidebar */}
      <aside className={`menu ${menuOpen ? "open" : ""}`}>
        <section>
          <h4>Dashboard</h4>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
        </section>

        <section>
          <h4>Earning Methods</h4>
          <button className="active">Offerwalls</button>
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

      {/* Main */}
      <main className="content">
        <h3>
          Welcome back, <span>{data.username}</span> 👋
        </h3>

        <div className="balance-card">
          <p>Available Balance</p>
          <h1>${data.balanceUSD?.toFixed(2)}</h1>
          <span>Pending: ${data.pendingUSD?.toFixed(2)}</span>
        </div>

        {/* Tabs */}
{/* Offerwall Selection Cards */}
<div className="offerwall-selector">
  {offerwalls.map((wall) => (
    <div
      key={wall.id}
      className={`offerwall-card ${
        activeWall === wall.id ? "active" : ""
      }`}
      onClick={() => setActiveWall(wall.id)}
    >
      <div className="card-header">
        <img src={wall.logo} alt={wall.name} />
        <h4>{wall.name}</h4>
      </div>

      <p>{wall.description}</p>

      <button className="launch-btn">
        {activeWall === wall.id ? "Active" : "Launch Wall"}
      </button>
    </div>
  ))}
</div>


      </main>

      <footer className="dashboard-footer">
        © 2026 StuHustle · Powered by PECO Industries
      </footer>
    </div>
  );
}

export default Offerwalls;
