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
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setData(snap.data());
      }
      setLoading(false);
    };

    loadUser();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleSave = async () => {
    await updateDoc(doc(db, "users", user.uid), {
      username: data.username,
    });
    setSuccess("Profile updated successfully.");
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loading) return <div className="profile loading">Loading...</div>;
  if (!data) return <div className="profile error">Failed to load profile.</div>;

  const firstLetter = data.username?.charAt(0).toUpperCase() || "U";

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
          <h4>Main</h4>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/wallet")}>Wallet</button>
        </section>

        <section>
          <h4>Account</h4>
          <button onClick={() => navigate("/profile")}>Profile</button>
          <button onClick={() => navigate("/support")}>Support</button>
          <button onClick={() => navigate("/security")}>Security</button>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </section>

      </aside>

      {/* MAIN */}
      <main className="profile-content">

        <div className="profile-card">

          <div className="avatar">{firstLetter}</div>

          <h3>{data.username}</h3>
          <p className="email">{user.email}</p>

          <div className="account-badges">
            <span className="badge role">{data.role || "User"}</span>
            <span className="badge status">{data.accountStatus || "Active"}</span>
          </div>

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

            <label>Account Created</label>
            <input
              type="text"
              value={data.createdAt?.toDate().toLocaleDateString() || "N/A"}
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
