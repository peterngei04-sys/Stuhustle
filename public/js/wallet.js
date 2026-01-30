/* ===== FIREBASE ===== */
const auth = firebase.auth();
const db = firebase.firestore();

/* ===== AUTH GUARD ===== */
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (!user.emailVerified) {
    alert("Please verify your email first");
    window.location.href = "verify.html";
    return;
  }

  loadBalance(user.uid);
});

/* ===== LOAD BALANCE ===== */
function loadBalance(uid) {
  db.collection("users").doc(uid).get().then(doc => {
    if (doc.exists) {
      const bal = doc.data().balance || 0;
      document.getElementById("balanceAmount").innerText =
        `$${bal.toFixed(2)}`;
    }
  });
}

/* ===== SIDEBAR ===== */
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

/* ===== MODALS ===== */
const paypalModal = document.getElementById("paypalModal");
const mpesaModal = document.getElementById("mpesaModal");

paypalBtn.onclick = () => paypalModal.classList.remove("hidden");
mpesaBtn.onclick = () => mpesaModal.classList.remove("hidden");

closePaypal.onclick = () => paypalModal.classList.add("hidden");
closeMpesa.onclick = () => mpesaModal.classList.add("hidden");

/* ===== CALC ===== */
const RATE = 150;
const FEE = 0.07;

function calc(amount) {
  const fee = amount * FEE;
  return {
    fee: fee.toFixed(2),
    net: (amount - fee).toFixed(2)
  };
}

/* PAYPAL */
paypalAmount.oninput = () => {
  const amt = Number(paypalAmount.value);
  if (amt >= 3) {
    const c = calc(amt);
    paypalFee.innerText = c.fee;
    paypalReceive.innerText = c.net;
  }
};

/* MPESA */
mpesaAmount.oninput = () => {
  const amt = Number(mpesaAmount.value);
  if (amt >= 3) {
    const c = calc(amt);
    mpesaFee.innerText = c.fee;
    mpesaReceive.innerText = Math.floor(c.net * RATE);
  }
};

/* ===== SUMMARY ===== */
function showSummary(method, account, amount, fee, receive) {
  summaryMethod.innerText = method;
  summaryAccount.innerText = account;
  summaryAmount.innerText = amount;
  summaryFee.innerText = fee;
  summaryReceive.innerText = receive;
  withdrawSummary.classList.remove("hidden");
}

/* CONFIRM */
confirmPaypal.onclick = () => {
  const amt = Number(paypalAmount.value);
  if (amt < 3) return alert("Minimum withdrawal is $3");

  const c = calc(amt);
  showSummary("PayPal", paypalEmail.value, amt, c.fee, `$${c.net}`);
  paypalModal.classList.add("hidden");
};

confirmMpesa.onclick = () => {
  const amt = Number(mpesaAmount.value);
  if (amt < 3) return alert("Minimum withdrawal is $3");

  const c = calc(amt);
  showSummary(
    "M-Pesa",
    mpesaNumber.value,
    amt,
    c.fee,
    `KES ${Math.floor(c.net * RATE)}`
  );
  mpesaModal.classList.add("hidden");
};

/* ===== SUBMIT REQUEST ===== */
withdrawBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;

  await db.collection("withdrawals").add({
    uid: user.uid,
    method: summaryMethod.innerText,
    account: summaryAccount.innerText,
    amount: Number(summaryAmount.innerText),
    fee: Number(summaryFee.innerText),
    status: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  pendingText.classList.remove("hidden");
  withdrawBtn.disabled = true;
};
