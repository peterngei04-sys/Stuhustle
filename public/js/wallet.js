const auth = firebase.auth();
const db = firebase.firestore();

/* ===== AUTH GUARD ===== */
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (!user.emailVerified) {
    document.getElementById("walletContent").innerHTML = `
      <div class="modal-card">
        <h3>Email Verification Required</h3>
        <p>Please verify your email to use withdrawals.</p>
        <button id="resendEmail" class="btn-primary">Resend Email</button>
      </div>
    `;
    document.getElementById("resendEmail").onclick = () => {
      user.sendEmailVerification().then(() =>
        alert("Verification email sent")
      );
    };
    return;
  }

  const snap = await db.collection("users").doc(user.uid).get();
  if (!snap.exists) return;

  const country = snap.data().country;
  if (country !== "KE") {
    document.getElementById("mpesaBtn").style.display = "none";
    document.getElementById("countryNotice").innerText =
      "M-Pesa is available for Kenyan users only.";
  }
});

/* ===== SIDEBAR ===== */
menuBtn.onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
};
overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};

/* ===== WITHDRAW LOGIC (UNCHANGED & WORKING) ===== */
const RATE = 150;
const FEE = 0.07;

function calc(a) {
  const fee = a * FEE;
  return { fee: fee.toFixed(2), net: (a - fee).toFixed(2) };
}

paypalBtn.onclick = () => paypalModal.classList.remove("hidden");
mpesaBtn.onclick = () => mpesaModal.classList.remove("hidden");
closePaypal.onclick = () => paypalModal.classList.add("hidden");
closeMpesa.onclick = () => mpesaModal.classList.add("hidden");

paypalAmount.oninput = () => {
  const c = calc(+paypalAmount.value);
  paypalFee.innerText = c.fee;
  paypalReceive.innerText = c.net;
};

mpesaAmount.oninput = () => {
  const c = calc(+mpesaAmount.value);
  mpesaFee.innerText = c.fee;
  mpesaReceive.innerText = Math.floor(c.net * RATE);
};

confirmPaypal.onclick = () => {
  confirmWithdrawal("PayPal", paypalEmail.value, paypalAmount.value,
    `$${calc(+paypalAmount.value).net}`,
    calc(+paypalAmount.value).fee);
  paypalModal.classList.add("hidden");
};

confirmMpesa.onclick = () => {
  confirmWithdrawal("M-Pesa", mpesaNumber.value, mpesaAmount.value,
    `KES ${Math.floor(calc(+mpesaAmount.value).net * RATE)}`,
    calc(+mpesaAmount.value).fee);
  mpesaModal.classList.add("hidden");
};

withdrawBtn.onclick = () => {
  pendingText.classList.remove("hidden");
  withdrawBtn.disabled = true;
};
