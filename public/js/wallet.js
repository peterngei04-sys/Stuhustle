/* ===== FIREBASE ===== */
const auth = firebase.auth();
const db = firebase.firestore();

/* ===== ELEMENTS ===== */
const openWithdrawBtn = document.getElementById("openWithdraw");
const withdrawModal = document.getElementById("withdrawModal");
const closeWithdrawBtn = document.getElementById("closeWithdraw");
const withdrawalSection = document.getElementById("withdrawalSection");

/* ===== AUTH STATE ===== */
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (!user.emailVerified) {
    showVerificationBlock(user);
  } else {
    enableWithdrawal();
  }

  loadWalletData(user.uid);
  loadTransactions(user.uid);
});

/* ===== VERIFICATION BLOCK ===== */
function showVerificationBlock(user) {
  withdrawalSection.style.display = "block";
  withdrawalSection.innerHTML = `
    <div class="verify-card">
      <h3>Email Verification Required</h3>
      <p>Please verify your email address before making withdrawals.</p>
      <button id="resendVerify" class="btn-primary">
        Resend Verification Email
      </button>
    </div>
  `;

  openWithdrawBtn.disabled = true;
  openWithdrawBtn.style.opacity = "0.5";

  document.getElementById("resendVerify").onclick = () => {
    user.sendEmailVerification()
      .then(() => {
        alert("Verification email sent. Check your inbox 📧");
      })
      .catch(err => alert(err.message));
  };
}

function enableWithdrawal() {
  withdrawalSection.style.display = "none";
  openWithdrawBtn.disabled = false;
  openWithdrawBtn.style.opacity = "1";
}

/* ===== WALLET DATA ===== */
function loadWalletData(uid) {
  db.collection("wallets").doc(uid).onSnapshot(doc => {
    if (!doc.exists) return;

    const data = doc.data();
    document.getElementById("availableBalance").innerText = `KES ${data.available || 0}`;
    document.getElementById("pendingBalance").innerText = `KES ${data.pending || 0}`;
    document.getElementById("escrowBalance").innerText = `KES ${data.escrow || 0}`;
  });
}

function loadTransactions(uid) {
  db.collection("transactions")
    .where("userId", "==", uid)
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {
      const list = document.getElementById("transactionList");
      list.innerHTML = "";

      if (snapshot.empty) {
        list.innerHTML = "<li>No transactions yet</li>";
        return;
      }

      snapshot.forEach(doc => {
        const t = doc.data();
        list.innerHTML += `
          <li>${t.type} — KES ${t.amount} (${t.status})</li>
        `;
      });
    });
}

/* ===== WITHDRAW MODAL ===== */
openWithdrawBtn.onclick = () => {
  withdrawModal.classList.add("show");
};

closeWithdrawBtn.onclick = () => {
  withdrawModal.classList.remove("show");
};

/* ===== WITHDRAW FEE ===== */
document.getElementById("withdrawAmount").oninput = e => {
  const amount = Number(e.target.value || 0);
  const fee = Math.floor(amount * 0.05);
  document.getElementById("feeAmount").innerText = fee;
};

/* ===== CONFIRM WITHDRAW ===== */
document.getElementById("confirmWithdraw").onclick = () => {
  alert("Withdrawal request submitted (backend logic later)");
};

/* ===== HAMBURGER ===== */
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuBtn.onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};