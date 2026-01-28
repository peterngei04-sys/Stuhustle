const auth = firebase.auth();
const db = firebase.firestore();

/* ===== CONSTANTS ===== */
const MIN_WITHDRAW_USD = 3;
const USD_TO_KES = 150; // approximate
const MIN_WITHDRAW_KES = MIN_WITHDRAW_USD * USD_TO_KES;

/* ===== ELEMENTS ===== */
const openWithdrawBtn = document.getElementById("openWithdraw");
const withdrawModal = document.getElementById("withdrawModal");
const closeWithdrawBtn = document.getElementById("closeWithdraw");
const verifyBox = document.getElementById("verifyBox");
const resendVerifyBtn = document.getElementById("resendVerify");
const withdrawError = document.getElementById("withdrawError");

/* ===== AUTH ===== */
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (!user.emailVerified) {
    lockWithdrawal(user);
  } else {
    unlockWithdrawal();
  }

  loadWallet(user.uid);
  loadTransactions(user.uid);
});

/* ===== VERIFICATION GUARD ===== */
function lockWithdrawal(user) {
  verifyBox.style.display = "block";
  openWithdrawBtn.disabled = true;
  openWithdrawBtn.style.opacity = "0.5";

  resendVerifyBtn.onclick = () => {
    user.sendEmailVerification()
      .then(() => alert("Verification email sent 📧"))
      .catch(err => alert(err.message));
  };
}

function unlockWithdrawal() {
  verifyBox.style.display = "none";
  openWithdrawBtn.disabled = false;
  openWithdrawBtn.style.opacity = "1";
}

/* ===== WALLET DATA ===== */
function loadWallet(uid) {
  db.collection("wallets").doc(uid).onSnapshot(doc => {
    if (!doc.exists) return;

    const d = doc.data();
    window.availableBalance = d.available || 0;

    document.getElementById("availableBalance").innerText = `KES ${d.available || 0}`;
    document.getElementById("pendingBalance").innerText = `KES ${d.pending || 0}`;
    document.getElementById("escrowBalance").innerText = `KES ${d.escrow || 0}`;
  });
}

/* ===== TRANSACTIONS ===== */
function loadTransactions(uid) {
  db.collection("transactions")
    .where("userId", "==", uid)
    .orderBy("createdAt", "desc")
    .onSnapshot(snap => {
      const list = document.getElementById("transactionList");
      list.innerHTML = "";

      if (snap.empty) {
        list.innerHTML = "<li>No transactions yet</li>";
        return;
      }

      snap.forEach(doc => {
        const t = doc.data();
        list.innerHTML += `<li>${t.type} — KES ${t.amount} (${t.status})</li>`;
      });
    });
}

/* ===== MODAL ===== */
openWithdrawBtn.onclick = () => {
  withdrawModal.classList.add("show");
  withdrawError.innerText = "";
};

closeWithdrawBtn.onclick = () => {
  withdrawModal.classList.remove("show");
};

/* ===== FEE ===== */
document.getElementById("withdrawAmount").oninput = e => {
  const amt = Number(e.target.value || 0);
  document.getElementById("feeAmount").innerText = Math.floor(amt * 0.05);
};

/* ===== WITHDRAW VALIDATION ===== */
document.getElementById("confirmWithdraw").onclick = () => {
  const amount = Number(document.getElementById("withdrawAmount").value);

  if (!amount || amount <= 0) {
    withdrawError.innerText = "Enter a valid amount";
    return;
  }

  if (amount < MIN_WITHDRAW_KES) {
    withdrawError.innerText = `Minimum withdrawal is $${MIN_WITHDRAW_USD} (≈ KES ${MIN_WITHDRAW_KES})`;
    return;
  }

  if (amount > window.availableBalance) {
    withdrawError.innerText = "Insufficient balance";
    return;
  }

  withdrawError.innerText = "";
  alert("Withdrawal request submitted (backend coming next)");
  withdrawModal.classList.remove("show");
};