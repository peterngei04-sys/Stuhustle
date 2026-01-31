/* ===============================
   STUHUSTLE WALLET SCRIPT
   PHONE-SAFE / NO REGRESSION
================================ */


(function () {

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(() => {

    /* ===== ELEMENTS ===== */
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    const paypalBtn = document.getElementById("paypalBtn");
    const mpesaBtn = document.getElementById("mpesaBtn");

    const paypalModal = document.getElementById("paypalModal");
    const mpesaModal = document.getElementById("mpesaModal");

    const closePaypal = document.getElementById("closePaypal");
    const closeMpesa = document.getElementById("closeMpesa");

    const paypalAmount = document.getElementById("paypalAmount");
    const paypalFee = document.getElementById("paypalFee");
    const paypalReceive = document.getElementById("paypalReceive");
    const paypalEmail = document.getElementById("paypalEmail");
    const confirmPaypal = document.getElementById("confirmPaypal");

    const mpesaAmount = document.getElementById("mpesaAmount");
    const mpesaFee = document.getElementById("mpesaFee");
    const mpesaReceive = document.getElementById("mpesaReceive");
    const mpesaNumber = document.getElementById("mpesaNumber");
    const mpesaName = document.getElementById("mpesaName");
    const confirmMpesa = document.getElementById("confirmMpesa");

    const withdrawSummary = document.getElementById("withdrawSummary");
    const withdrawBtn = document.getElementById("withdrawBtn");
    const pendingText = document.getElementById("pendingText");

    const summaryMethod = document.getElementById("summaryMethod");
    const summaryAccount = document.getElementById("summaryAccount");
    const summaryAmount = document.getElementById("summaryAmount");
    const summaryFee = document.getElementById("summaryFee");
    const summaryReceive = document.getElementById("summaryReceive");

    /* ===== SIDEBAR ===== */
    if (menuBtn && sidebar && overlay) {
      menuBtn.addEventListener("click", () => {
        sidebar.classList.add("open");
        overlay.classList.add("show");
      });

      overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
      });
    }

    /* ===== MODALS ===== */
    paypalBtn && paypalBtn.addEventListener("click", () => {
      paypalModal.classList.remove("hidden");
    });

    mpesaBtn && mpesaBtn.addEventListener("click", () => {
      mpesaModal.classList.remove("hidden");
    });

    closePaypal && closePaypal.addEventListener("click", () => {
      paypalModal.classList.add("hidden");
    });

    closeMpesa && closeMpesa.addEventListener("click", () => {
      mpesaModal.classList.add("hidden");
    });

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

    /* ===== PAYPAL INPUT ===== */
    paypalAmount && paypalAmount.addEventListener("input", () => {
      const amt = Number(paypalAmount.value);
      if (amt >= 3) {
        const c = calc(amt);
        paypalFee.textContent = c.fee;
        paypalReceive.textContent = c.net;
      }
    });

    /* ===== MPESA INPUT ===== */
    mpesaAmount && mpesaAmount.addEventListener("input", () => {
      const amt = Number(mpesaAmount.value);
      if (amt >= 3) {
        const c = calc(amt);
        mpesaFee.textContent = c.fee;
        mpesaReceive.textContent = Math.floor(c.net * RATE);
      }
    });

    /* ===== SUMMARY ===== */
    function confirmWithdrawal(method, account, amount, receive, fee) {
      summaryMethod.textContent = method;
      summaryAccount.textContent = account;
      summaryAmount.textContent = amount;
      summaryFee.textContent = fee;
      summaryReceive.textContent = receive;
      withdrawSummary.classList.remove("hidden");
    }

    /* ===== PAYPAL CONFIRM ===== */
    confirmPaypal && confirmPaypal.addEventListener("click", () => {
      const amt = Number(paypalAmount.value);
      if (amt < 3) return alert("Minimum withdrawal is $3");
      if (!paypalEmail.value) return alert("Enter PayPal email");

      const c = calc(amt);
      confirmWithdrawal(
        "PayPal",
        paypalEmail.value,
        amt,
        `$${c.net}`,
        c.fee
      );
      paypalModal.classList.add("hidden");
    });

    /* ===== MPESA CONFIRM ===== */
    confirmMpesa && confirmMpesa.addEventListener("click", () => {
      const amt = Number(mpesaAmount.value);
      if (amt < 3) return alert("Minimum withdrawal is $3");
      if (!mpesaNumber.value || !mpesaName.value)
        return alert("Enter M-Pesa name and number");

      const c = calc(amt);
      confirmWithdrawal(
        "M-Pesa",
        `${mpesaName.value} (${mpesaNumber.value})`,
        amt,
        `KES ${Math.floor(c.net * RATE)}`,
        c.fee
      );
      mpesaModal.classList.add("hidden");
    });


    /* ===== FINAL WITHDRAW ===== */
document.addEventListener("DOMContentLoaded", () => {
  const withdrawBtn = document.getElementById("withdrawBtn");

  if (!withdrawBtn) {
    console.error("withdrawBtn not found");
    return;
  }

  withdrawBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const user = firebase.auth().currentUser;
    if (!user) return alert("User not logged in");

    withdrawBtn.disabled = true;
    pendingText.classList.remove("hidden");

    try {
      await firebase.firestore().collection("withdrawals").add({
        userId: user.uid,
        method: summaryMethod.innerText,
        account: summaryAccount.innerText,
        amountUSD: Number(summaryAmount.innerText),
        feeUSD: Number(summaryFee.innerText),
        receive: summaryReceive.innerText,
        status: "pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert("Withdrawal submitted ⏳ Pending approval");
    } catch (err) {
      console.error(err);
      alert("Failed to submit withdrawal");
      withdrawBtn.disabled = false;
      pendingText.classList.add("hidden");
    }
  });
});

/* ===== EMAIL VERIFICATION GUARD ===== */

firebase.auth().onAuthStateChanged((user) => {
  if (!user) return;

  // If email NOT verified
  if (!user.emailVerified) {
    withdrawBtn.disabled = true;

    pendingText.classList.remove("hidden");
    pendingText.innerHTML = `
      ⚠️ Please verify your email before withdrawing.<br>
      <button id="resendEmail" style="
        margin-top:8px;
        background:#2563eb;
        color:white;
        border:none;
        padding:6px 12px;
        border-radius:8px;
        cursor:pointer;
      ">
        Resend verification email
      </button>
    `;

    // Resend verification
    document.getElementById("resendEmail").onclick = () => {
      user.sendEmailVerification()
        .then(() => {
          alert("Verification email sent. Check your inbox.");
        })
        .catch((err) => {
          alert(err.message);
        });
    };

  } else {
    // Email verified → allow withdrawal
    withdrawBtn.disabled = false;
    pendingText.classList.add("hidden");
  }
});
/* ===== COUNTRY LOCK (MPESA = KENYA ONLY) ===== */

firebase.auth().onAuthStateChanged((user) => {
  if (!user) return;

  firebase.firestore()
    .collection("users")
    .doc(user.uid)
    .get()
    .then((doc) => {
      if (!doc.exists) return;

      const userCountry = (doc.data().country || "").toLowerCase();

      // Intercept MPESA button
      mpesaBtn.onclick = () => {
        if (userCountry !== "kenya") {
          alert("M-Pesa withdrawals are only available for Kenyan users 🇰🇪");
          return;
        }
        mpesaModal.classList.remove("hidden");
      };

    })
    .catch((err) => {
      console.error("Country check failed:", err);
    });
});
/* ===== STEP 3: SAVE WITHDRAWAL TO FIRESTORE ===== */

withdrawBtn?.addEventListener("click", async () => {
  const user = firebase.auth().currentUser;
  if (!user) return alert("Not authenticated");

  withdrawBtn.disabled = true;
  pendingText.classList.remove("hidden");

  try {
    await firebase.firestore().collection("withdrawals").add({
      userId: user.uid,
      method: summaryMethod.innerText,
      account: summaryAccount.innerText,
      amountUSD: Number(summaryAmount.innerText),
      feeUSD: Number(summaryFee.innerText),
      receive: summaryReceive.innerText,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Withdrawal request submitted. Processing within 24 hours ⏳");
  } catch (err) {
    console.error(err);
    alert("Withdrawal failed. Try again.");
    withdrawBtn.disabled = false;
    pendingText.classList.add("hidden");
  }
});
