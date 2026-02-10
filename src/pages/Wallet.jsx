import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/wallet.css";

function Wallet() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [userData, setUserData] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const WITHDRAW_MIN = 2;
  const FEE_RATE = 0.15;

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUserData(snap.data());

      const q = query(
        collection(db, "withdrawals"),
        where("uid", "==", user.uid)
      );
      const wsnap = await getDocs(q);
      setWithdrawals(wsnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    loadData();
  }, [user]);

  const handleWithdraw = async () => {
    setError("");
    const amt = Number(amount);

    if (amt < WITHDRAW_MIN) {
      return setError("Minimum withdrawal is $2");
    }

    if (amt > userData.balanceUSD) {
      return setError("Insufficient balance");
    }

    setLoading(true);

    const fee = amt * FEE_RATE;
    const net = amt - fee;

    try {
      await addDoc(collection(db, "withdrawals"), {
        uid: user.uid,
        email: paypalEmail,
        amount: amt,
        fee,
        netAmount: net,
        method: "paypal",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "users", user.uid), {
        balanceUSD: userData.balanceUSD - amt,
        pendingUSD: (userData.pendingUSD || 0) + amt,
      });

      setShowWithdraw(false);
      setAmount("");
      setPaypalEmail("");
      window.location.reload();
    } catch (err) {
      setError("Withdrawal failed. Try again.");
    }

    setLoading(false);
  };

  if (!userData) return <div className="wallet">Loading...</div>;

  return (
    <div className="wallet">
      <header className="wallet-header">
        <button onClick={() => navigate("/dashboard")}>← Back</button>
        <h2>Wallet</h2>
      </header>

      <div className="wallet-cards">
        <div className="card">
          <p>Available Balance</p>
          <h1>${userData.balanceUSD.toFixed(2)}</h1>
        </div>

        <div className="card">
          <p>Pending Withdrawals</p>
          <h1>${(userData.pendingUSD || 0).toFixed(2)}</h1>
        </div>
      </div>

      <button className="withdraw-btn" onClick={() => setShowWithdraw(true)}>
        Withdraw via PayPal
      </button>

      {/* MODAL */}
      {showWithdraw && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>PayPal Withdrawal</h3>

            {error && <p className="error">{error}</p>}

            <input
              placeholder="PayPal Email"
              value={paypalEmail}
              onChange={e => setPaypalEmail(e.target.value)}
            />

            <input
              type="number"
              placeholder="Amount ($)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />

            <p className="fee">
              Fee (15%): ${(amount * FEE_RATE || 0).toFixed(2)} <br />
              You receive: ${(amount - amount * FEE_RATE || 0).toFixed(2)}
            </p>

            <button onClick={handleWithdraw} disabled={loading}>
              {loading ? "Processing..." : "Confirm Withdrawal"}
            </button>

            <button className="cancel" onClick={() => setShowWithdraw(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <section className="history">
        <h3>Withdrawal History</h3>

        {withdrawals.length === 0 && <p>No withdrawals yet.</p>}

        {withdrawals.map(w => (
          <div key={w.id} className={`history-item ${w.status}`}>
            <div>
              <strong>${w.amount}</strong> → ${w.netAmount}
            </div>
            <span>{w.status.toUpperCase()}</span>
          </div>
        ))}
      </section>

      <footer className="wallet-footer">
        © 2026 StuHustle · Powered by PECO Industries
      </footer>
    </div>
  );
}

export default Wallet;
