ocument.addEventListener("DOMContentLoaded", () => {

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
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.add("open");
      overlay.classList.add("show");
      document.body.classList.add("menu-open");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
      document.body.classList.remove("menu-open");
    });
  }

  /* ===== MODALS ===== */
  paypalBtn?.addEventListener("click", () => paypalModal.classList.remove("hidden"));
  mpesaBtn?.addEventListener("click", () => mpesaModal.classList.remove("hidden"));

  closePaypal?.addEventListener("click", () => paypalModal.classList.add("hidden"));
  closeMpesa?.addEventListener("click", () => mpesaModal.classList.add("hidden"));

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
  paypalAmount?.addEventListener("input", () => {
    const amt = Number(paypalAmount.value);
    if (amt >= 3) {
      const c = calc(amt);
      paypalFee.innerText = c.fee;
      paypalReceive.innerText = c.net;
    }
  });

  /* ===== MPESA INPUT ===== */
  mpesaAmount?.addEventListener("input", () => {
    const amt = Number(mpesaAmount.value);
    if (amt >= 3) {
      const c = calc(amt);
      mpesaFee.innerText = c.fee;
      mpesaReceive.innerText = Math.floor(c.net * RATE);
    }
  });

  /* ===== CONFIRM SUMMARY ===== */
  function confirmWithdrawal(method, account, amount, receive, fee) {
    summaryMethod.innerText = method;
    summaryAccount.innerText = account;
    summaryAmount.innerText = amount;
    summaryFee.innerText = fee;
    summaryReceive.innerText = receive;
    withdrawSummary.classList.remove("hidden");
  }

  /* ===== PAYPAL CONFIRM ===== */
  confirmPaypal?.addEventListener("click", () => {
    const amt = Number(paypalAmount.value);
    if (amt < 3) return alert("Minimum withdrawal is $3");

    const c = calc(amt);
    confirmWithdrawal("PayPal", paypalEmail.value, amt, `$${c.net}`, c.fee);
    paypalModal.classList.add("hidden");
  });

  /* ===== MPESA CONFIRM ===== */
  confirmMpesa?.addEventListener("click", () => {
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
  });

  /* ===== FINAL WITHDRAW ===== */
  withdrawBtn?.addEventListener("click", () => {
    pendingText.classList.remove("hidden");
    withdrawBtn.disabled = true;
  });

});
