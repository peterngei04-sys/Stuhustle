import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import useUserData from "../hooks/useUserData";
import "../styles/wallet.css";

function Wallet() {
  const navigate = useNavigate();
  const { data, loading } = useUserData();

  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // ✅ Real-time withdrawal listener
  useEffect(() => {
    if (!auth.currentUser) return;

    const withdrawalsQuery = query(
      collection(db, "withdrawals"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(withdrawalsQuery, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWithdrawals(list);
    });

    return () => unsubscribe();
  }, []);

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
      const netAmount = (amount * 0.85).toFixed(2);

      await addDoc(collection(db, "withdrawals"), {
        userId: auth.currentUser.uid,
        username: data.username,
        amount,
        netAmount,
        paypalEmail,
        status: "pending",
        createdAt: Timestamp.now(),
      });

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        pendingUSD: (data.pendingUSD || 0) + amount,
        balanceUSD: (data.balanceUSD || 0) - amount,
      });

      setSuccess(
        `Withdrawal request of $${amount} submitted. Pending approval.`
      );

      setWithdrawAmount("");
      setPaypalEmail("");
    } catch (err) {
      console.error(err);
      setError("Withdrawal failed. Try again.");
    }
  };

  if (loading) return <div className="wallet loading">Loading Wallet...</div>;

  return (
    <div className="wallet-page">
      {/* Topbar */}
      <header className="topbar">
        <button className="hamburger" onClick={toggleMenu}>
          ☰
        </button>
        <h2>StuHustle</h2>
      </header>

      {/* Overlay */}
      {menuOpen && (
        <div className="menu-overlay" onClick={closeMenu}></div>
      )}

      {/* Sidebar */}
      <aside className={`menu ${menuOpen ? "open" : ""}`}>
        <section>
          <h4>Dashboard</h4>
          <button onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </section>

        <section>
          <h4>Earning Methods</h4>
          <button onClick={() => navigate("/offerwalls")}>
            Offerwalls
          </button>
          <button onClick={() => navigate("/microtasks")}>
            Micro Tasks
          </button>
          <button onClick={() => navigate("/referral")}>
            Referrals
          </button>
          <button onClick={() => navigate("/featured")}>
            Featured Opportunities
          </button>
          <button onClick={() => navigate("/freelancing")}>
            Freelancing Hub
          </button>
        </section>

        <section>
          <h4>Wallet</h4>
          <button className="active">Wallet</button>
        </section>

        <section>
          <h4>Account</h4>
          <button onClick={() => navigate("/profile")}>
            Profile
          </button>
          <button onClick={() => navigate("/security")}>
            Security
          </button>
          <button onClick={() => navigate("/support")}>
            Support
          </button>
                <button className="logout" onClick={handleLogout}>
  Logout
</button>
        </section>
      </aside>

      {/* Main Content */}
      <main className="wallet-content">
        <h2>My Wallet 💰</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="wallet-balance">
          <p>Available Balance</p>
          <h1>${data.balanceUSD?.toFixed(2)}</h1>
          <span>Pending: ${data.pendingUSD?.toFixed(2)}</span>
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

          <button onClick={handleWithdraw}>
            Request Withdrawal
          </button>

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
                .sort(
                  (a, b) =>
                    b.createdAt?.seconds - a.createdAt?.seconds
                )
                .map((w) => (
                  <li key={w.id}>
                    <p>
                      <strong>Amount:</strong> ${w.amount} |{" "}
                      <strong>Net:</strong> ${w.netAmount} |{" "}
                      <strong>Status:</strong> {w.status}
                    </p>
                    <p>
                      {w.createdAt?.toDate().toLocaleString()}
                    </p>
                  </li>
                ))}
            </ul>
          ) : (
            <p>No withdrawals yet.</p>
          )}
        </div>
      </main>

      <footer className="wallet-footer">
        © 2026 StuHustle · Powered by PECO Industries
      </footer>
    </div>
  );
}

export default Wallet;
