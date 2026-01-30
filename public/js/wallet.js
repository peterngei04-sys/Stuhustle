/* ===== SIDEBAR ===== */
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuBtn.onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
  document.body.classList.add("menu-open");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
  document.body.classList.remove("menu-open");
};

/* ===== MODALS ===== */
const paypalModal = document.getElementById("paypalModal");
const mpesaModal = document.getElementById("mpesaModal");

document.getElementById("paypalBtn").onclick = () => paypalModal.classList.remove("hidden");
document.getElementById("mpesaBtn").onclick = () => mpesaModal.classList.remove("hidden");

document.getElementById("closePaypal").onclick = () => paypalModal.classList.add("hidden");
document.getElementById("closeMpesa").onclick = () => mpesaModal.classList.add("hidden");

/* ===== CALCULATIONS ===== */
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

/* CONFIRM */
function confirmWithdrawal(method, account, amount, receive, fee) {
  summaryMethod.innerText = method;
  summaryAccount.innerText = account;
  summaryAmount.innerText = amount;
  summaryFee.innerText = fee;
  summaryReceive.innerText = receive;

  withdrawSummary.classList.remove("hidden");
}

/* PAYPAL CONFIRM */
confirmPaypal.onclick = () => {
  const amt = Number(paypalAmount.value);
  if (amt < 3) return alert("Minimum withdrawal is $3");

  const c = calc(amt);
  confirmWithdrawal(
    "PayPal",
    paypalEmail.value,
    amt,
    `$${c.net}`,
    c.fee
  );
  paypalModal.classList.add("hidden");
};

/* MPESA CONFIRM */
confirmMpesa.onclick = () => {
  const amt = Number(mpesaAmount.value);
  if (amt < 3) return alert("Minimum withdrawal is $3");

  const c = calc(amt);
  confirmWithdrawal(
    "M-Pesa",
    mpesaNumber.value,
    amt,
    `KES ${Math.floor(c.net * RATE)}`,
    c.fee
  );
  mpesaModal.classList.add("hidden");
};

/* FINAL WITHDRAW */
withdrawBtn.onclick = () => {
  pendingText.classList.remove("hidden");
  withdrawBtn.disabled = true;
};
/* ================================
   FIREBASE GUARDS & DATA (ADD ONLY)
================================ */

/* Ensure Firebase is loaded */
const auth = firebase.auth();
const db = firebase.firestore();

/* ===== AUTH + EMAIL VERIFICATION GUARD ===== */
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (!user.emailVerified) {
    document.getElementById("walletContent").innerHTML = `
      <div class="withdraw-summary">
        <h3>Email Verification Required</h3>
        <p>Please verify your email before withdrawing.</p>
        <button class="btn-primary" id="resendVerify">
          Resend Verification Email
        </button>
      </div>
    `;

    document.getElementById("resendVerify").onclick = () => {
      user.sendEmailVerification().then(() => {
        alert("Verification email sent. Check your inbox.");
      });
    };
    return;
  }

  loadUserBalance(user.uid);
  applyCountryLock();
});

/* ===== LOAD REAL BALANCE FROM FIRESTORE ===== */
function loadUserBalance(uid) {
  db.collection("users").doc(uid).get().then(doc => {
    if (doc.exists) {
      const balance = doc.data().balance || 0;
      document.querySelector(".amount").innerText = `$${balance.toFixed(2)}`;
    }
  });
}

/* ===== COUNTRY-BASED WITHDRAWAL LOCK ===== */
function applyCountryLock() {
  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(data => {
      const country = data.country_code;
      const notice = document.getElementById("countryNotice");

      if (country !== "KE") {
        document.getElementById("mpesaBtn").style.display = "none";
        notice.innerText = "M-Pesa is only available in Kenya. PayPal enabled.";
      } else {
        notice.innerText = "M-Pesa and PayPal withdrawals are available.";
      }
    })
    .catch(() => {
      console.warn("Country detection failed");
    });
}

/* ===== SAVE WITHDRAWAL TO FIRESTORE (ON FINAL CONFIRM) ===== */
const originalWithdraw = withdrawBtn.onclick;

withdrawBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;

  await db.collection("withdrawals").add({
    uid: user.uid,
    method: summaryMethod.innerText,
    account: summaryAccount.innerText,
    amount: Number(summaryAmount.innerText),
    status: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  pendingText.classList.remove("hidden");
  withdrawBtn.disabled = true;
};
