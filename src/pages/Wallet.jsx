import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // ✅ ADDED
import "../styles/wallet.css";

function Wallet() {
  const user = auth.currentUser;
  const navigate = useNavigate(); // ✅ ADDED

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ ADDED (menu state)
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setData(snap.data());
        }
      } catch (err) {
        console.error("Failed to load wallet data", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleWithdraw = async () => {
    setError("");
    setSuccess("");

    const amount = parseFloat(withdrawAmount);

    if (!paypalEmail) return setError("Please enter your PayPal email.");
    if (isNaN(amount) || amount < 2)
      return setError("Minimum withdrawal is $2.");
    if (amount > data.balanceUSD)
      return setError("You don't have enough balance.");

    try {
      const netAmount = amount * 0.85;

      await updateDoc(doc(db, "users", user.uid), {
        pendingUSD: (data.pendingUSD || 0) + amount,
        balanceUSD: (data.balanceUSD || 0) - amount,
        withdrawals: arrayUnion({
          amount,
          netAmount: netAmount.toFixed(2),
          paypalEmail,
          status: "pending",
          createdAt: Timestamp.now(),
        }),
      });

      setSuccess(`Withdrawal request of $${amount} submitted. Pending approval.`);
      setWithdrawAmount("");
      setPaypalEmail("");

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setData(snap.data());
    } catch (err) {
      console.error(err);
      setError("Withdrawal failed. Try again.");
    }
  };

  if (loading) return <div className="wallet loading">Loading Wallet...</div>;
  if (!data) return <div className="wallet error">Failed to load wallet.</div>;

  return (
    <div className="wallet">

      {/* ✅ ADDED: TOP BAR */}
      <header className="topbar">
        <button className="hamburger" onClick={toggleMenu}>☰</button>
        <h2>StuHustle</h2>
      </header>

      {/* ✅ ADDED: OVERLAY */}
      {menuOpen && <div className="menu-overlay" onClick={closeMenu} />}

      {/* ✅ ADDED: SIDE MENU */}
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
          <button>Profile</button>
          <button>Security</button>
          <button>Support</button>
          <button className="logout" onClick={() => navigate("/login")}>
            Logout
          </button>
        </section>
      </aside>

      {/* ===== EXISTING CONTENT (UNCHANGED) ===== */}
      <h2>My Wallet 💰</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="wallet-balance">
        <p>Available Balance:</p>
        <h1>${(data.balanceUSD || 0).toFixed(2)}</h1>
        <p>Pending: ${(data.pendingUSD || 0).toFixed(2)}</p>
      </div>

      <div className="withdraw-card">
        <h3>Withdraw via PayPal</h3>
        <input
          type="email"
          placeholder="Your PayPal Email"
          value={paypalEmail}
          onChange={(e) => setPaypalEmail(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount in USD"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />
        <button onClick={handleWithdraw}>Request Withdrawal</button>
        <p className="info">
          Minimum withdrawal $2. Fee 15%. Pending approval will be processed within 24 hrs.
        </p>
      </div>

      <div className="withdraw-history">
        <h3>Withdrawal History</h3>
        {data.withdrawals && data.withdrawals.length > 0 ? (
          <ul>
            {data.withdrawals
              .slice()
              .reverse()
              .map((w, idx) => (
                <li key={idx}>
                  <p>
                    <strong>Amount:</strong> ${w.amount} | <strong>Net:</strong> $
                    {w.netAmount} | <strong>Email:</strong> {w.paypalEmail}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {w.status === "pending"
                      ? "Pending"
                      : w.status === "approved"
                      ? "Approved"
                      : "Paid"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {w.createdAt.toDate
                      ? w.createdAt.toDate().toLocaleString()
                      : new Date(w.createdAt.seconds * 1000).toLocaleString()}
                  </p>
                </li>
              ))}
          </ul>
        ) : (
          <p>No withdrawals yet.</p>
        )}
      </div>

      <footer className="wallet-footer">
        © 2026 StuHustle · Powered by PECO Industries
      </footer>
    </div>
  );
}

export default Wallet;
