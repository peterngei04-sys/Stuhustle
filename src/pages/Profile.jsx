import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

function Profile() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [success, setSuccess] = useState("");

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!user) return;

    const loadUser = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setData(snap.data());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        username: data.username,
      });
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="profile loading">Loading...</div>;
  if (!data) return <div className="profile error">Failed to load profile.</div>;

  const firstLetter = data.username
    ? data.username.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="profile">
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
          <button>Offerwalls</button>
          <button>Paid Tasks</button>
          <button>Micro Jobs</button>
          <button>Affiliate Marketing</button>
          <button>Referrals</button>
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
          <button>Security</button>
          <button>Support</button>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </section>
      </aside>

      {/* MAIN */}
      <main className="profile-content">

        <div className="profile-card">

          {/* Avatar */}
          <div className="avatar">
            {firstLetter}
          </div>

          <h3>{data.username}</h3>
          <p className="email">{user.email}</p>

          {success && <p className="success">{success}</p>}

          <div className="profile-form">
            <label>Username</label>
            <input
              type="text"
              value={data.username}
              onChange={(e) =>
                setData({ ...data, username: e.target.value })
              }
            />

            <label>Email</label>
            <input type="email" value={user.email} disabled />

            <label>Account Status</label>
            <input
              type="text"
              value={data.accountStatus || "active"}
              disabled
            />

            <button onClick={handleSave}>Save Changes</button>
          </div>
        </div>

      </main>

      <footer className="profile-footer">
        © 2026 StuHustle · Powered by PECO Industries
      </footer>
    </div>
  );
}

export default Profile;
