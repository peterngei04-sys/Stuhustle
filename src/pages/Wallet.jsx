import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/wallet.css";

function Wallet() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      try {
        // Load user data
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setData(snap.data());
        }

        // ✅ Load withdrawals from collection
        const q = query(
          collection(db, "withdrawals"),
          where("userId", "==", user.uid)
        );

        const withdrawSnap = await getDocs(q);
        const withdrawList = withdrawSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setWithdrawals(withdrawList);

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

      // ✅ 1. Create withdrawal document
      await addDoc(collection(db, "withdrawals"), {
        userId: user.uid,
        username: data.username,
        amount,
        netAmount: netAmount.toFixed(2),
        paypalEmail,
        status: "pending",
        createdAt: Timestamp.now(),
      });

      // ✅ 2. Update user balances
      await updateDoc(doc(db, "users", user.uid), {
        pendingUSD: (data.pendingUSD || 0) + amount,
        balanceUSD: (data.balanceUSD || 0) - amount,
      });

      setSuccess(`Withdrawal request of $${amount} submitted. Pending approval.`);
      setWithdrawAmount("");
      setPaypalEmail("");

      // Refresh
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setData(snap.data());

      const q = query(
        collection(db, "withdrawals"),
        where("userId", "==", user.uid)
      );
      const withdrawSnap = await getDocs(q);
      const withdrawList = withdrawSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWithdrawals(withdrawList);

    } catch (err) {
      console.error(err);
      setError("Withdrawal failed. Try again.");
    }
  };

  if (loading) return <div className="wallet loading">Loading Wallet...</div>;
  if (!data) return <div className="wallet error">Failed to load wallet.</div>;

  return (
    <div className="wallet">

      {/* TOP BAR */}
      <header className="topbar">
        <button className="hamburger" onClick={toggleMenu}>☰</button>
        <h2>StuHustle</h2>
      </header>

      {menuOpen && <div className="menu-overlay" onClick={closeMenu} />}

      <aside className={`menu ${menuOpen ? "open" : ""}`}>
        <section>
          <h4>Earning Methods</h4>
          <button>Offerwalls</button>
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
          <button onClick={() => navigate("/profile")}>
  Profile
</button>
          <button onClick={() => navigate("/security")}>Security</button>
          <button onClick={() => navigate("/support")}>Support</button>
          <button className="logout" onClick={() => navigate("/login")}>
            Logout
          </button>
        </section>
      </aside>

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
          Minimum withdrawal $2. Fee 15%. Pending approval within 24 hrs.
        </p>
      </div>

      <div className="withdraw-history">
        <h3>Withdrawal History</h3>
        {withdrawals.length > 0 ? (
          <ul>
            {withdrawals
              .slice()
              .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
              .map((w) => (
                <li key={w.id}>
                  <p>
                    <strong>Amount:</strong> ${w.amount} | 
                    <strong> Net:</strong> ${w.netAmount} | 
                    <strong> Email:</strong> {w.paypalEmail}
                  </p>
                  <p>
                    <strong>Status:</strong> {w.status}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {w.createdAt?.toDate().toLocaleString()}
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
