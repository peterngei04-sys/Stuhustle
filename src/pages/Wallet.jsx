import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/wallet.css";

function Wallet() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Withdraw modal
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [amount, setAmount] = useState("");

  const MIN_WITHDRAW = 2;
  const FEE_RATE = 0.15;

  useEffect(() => {
    if (!user) return;

    const loadWallet = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setData(snap.data());
      } catch (e) {
        console.error("Wallet load error", e);
      } finally {
        setLoading(false);
      }
    };

    loadWallet();
  }, [user]);

  const handleWithdraw = async () => {
    const value = parseFloat(amount);
    if (!paypalEmail || !value) return alert("Fill all fields");

    if (value < MIN_WITHDRAW) {
      return alert("Minimum withdrawal is $2.00");
    }

    if (value > data.balanceUSD) {
      return alert("Insufficient balance");
    }

    const fee = value * FEE_RATE;
    const receive = value - fee;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        balanceUSD: data.balanceUSD - value,
        pendingUSD: (data.pendingUSD || 0) + receive,
        withdrawals: arrayUnion({
          amount: value,
          fee,
          receive,
          method: "PayPal",
          paypalEmail,
          status: "pending",
          createdAt: serverTimestamp(),
        }),
      });

      alert("Withdrawal submitted. Processing within 24 hours.");
      setShowWithdraw(false);
      setAmount("");
      setPaypalEmail("");

      const snap = await getDoc(doc(db, "users", user.uid));
      setData(snap.data());
    } catch (e) {
      alert("Withdrawal failed");
    }
  };

  if (loading) return <div className="wallet loading">Loading wallet...</div>;

  return (
    <div className="wallet">
      {/* HEADER */}
      <header className="wallet-header">
        <button onClick={() => navigate("/dashboard")}>← Back</button>
        <h2>Wallet</h2>
      </header>

      {/* BALANCES */}
      <div className="wallet-cards">
        <div className="card">
          <p>Available Balance</p>
          <h1>${(data.balanceUSD || 0).toFixed(2)}</h1>
        </div>

        <div className="card pending">
          <p>Pending Balance</p>
          <h2>${(data.pendingUSD || 0).toFixed(2)}</h2>
        </div>
      </div>

      {/* PAYPAL WITHDRAW */}
      <section className="withdraw-section">
        <h3>Withdraw Funds</h3>
        <button className="paypal-btn" onClick={() => setShowWithdraw(true)}>
          <img src="/paypal.svg" alt="PayPal" />
          Withdraw via PayPal
        </button>
        <p className="rules">
          Minimum: $2 • Fee: 15% • Processing: within 24 hours
        </p>
      </section>

      {/* WITHDRAW MODAL */}
      {showWithdraw && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>PayPal Withdrawal</h3>

            <input
              type="email"
              placeholder="PayPal Email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
            />

            <input
              type="number"
              placeholder="Amount (USD)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            {amount && (
              <div className="calc">
                <p>Fee (15%): ${(amount * FEE_RATE).toFixed(2)}</p>
                <p className="receive">
                  You Receive: ${(amount - amount * FEE_RATE).toFixed(2)}
                </p>
              </div>
            )}

            <button className="confirm" onClick={handleWithdraw}>
              Confirm Withdrawal
            </button>
            <button className="cancel" onClick={() => setShowWithdraw(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* HISTORY */}
      <section className="history">
        <h3>Withdrawal History</h3>

        {data.withdrawals?.length ? (
          data.withdrawals
            .slice()
            .reverse()
            .map((w, i) => (
              <div className="history-item" key={i}>
                <div>
                  <strong>${w.receive.toFixed(2)}</strong>
                  <span>PayPal</span>
                </div>
                <span className={w.status}>{w.status}</span>
              </div>
            ))
        ) : (
          <p className="empty">No withdrawals yet</p>
        )}
      </section>

      {/* FOOTER */}
      <footer className="wallet-footer">
        © 2026 StuHustle · Powered by PECO Industries
      </footer>
    </div>
  );
}

export default Wallet;
