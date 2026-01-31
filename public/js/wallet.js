window.addEventListener("load", () => {

  /* ========= SAFE GET ========= */
  const $ = (id) => document.getElementById(id);

  /* ========= ELEMENTS ========= */
  const menuBtn = $("menuBtn");
  const sidebar = $("sidebar");
  const overlay = $("overlay");

  const paypalBtn = $("paypalBtn");
  const mpesaBtn = $("mpesaBtn");

  const paypalModal = $("paypalModal");
  const mpesaModal = $("mpesaModal");

  const closePaypal = $("closePaypal");
  const closeMpesa = $("closeMpesa");

  const paypalEmail = $("paypalEmail");
  const paypalAmount = $("paypalAmount");
  const paypalFee = $("paypalFee");
  const paypalReceive = $("paypalReceive");
  const confirmPaypal = $("confirmPaypal");

  const mpesaName = $("mpesaName");
  const mpesaNumber = $("mpesaNumber");
  const mpesaAmount = $("mpesaAmount");
  const mpesaFee = $("mpesaFee");
  const mpesaReceive = $("mpesaReceive");
  const confirmMpesa = $("confirmMpesa");

  const withdrawSummary = $("withdrawSummary");
  const withdrawBtn = $("withdrawBtn");
  const pendingText = $("pendingText");

  const summaryMethod = $("summaryMethod");
  const summaryAccount = $("summaryAccount");
  const summaryAmount = $("summaryAmount");
  const summaryFee = $("summaryFee");
  const summaryReceive = $("summaryReceive");

  /* ========= SIDEBAR ========= */
  if (menuBtn && sidebar && overlay) {
    menuBtn.onclick = () => {
      sidebar.classList.add("open");
      overlay.classList.add("show");
    };

    overlay.onclick = () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    };
  }

  /* ========= MODALS ========= */
  paypalBtn && paypalBtn.onclick = () => paypalModal.classList.remove("hidden");
  mpesaBtn && mpesaBtn.onclick = () => mpesaModal.classList.remove("hidden");

  closePaypal && closePaypal.onclick = () => paypalModal.classList.add("hidden");
  closeMpesa && closeMpesa.onclick = () => mpesaModal.classList.add("hidden");

  /* ========= CALC ========= */
  const RATE = 150;
  const FEE = 0.07;

  const calc = (amount) => {
    const fee = amount * FEE;
    return {
      fee: fee.toFixed(2),
      net: (amount - fee).toFixed(2)
    };
  };

  /* ========= PAYPAL ========= */
  paypalAmount && paypalAmount.addEventListener("input", () => {
    const amt = Number(paypalAmount.value);
    if (amt >= 3) {
      const c = calc(amt);
      paypalFee.textContent = c.fee;
      paypalReceive.textContent = c.net;
    }
  });

  /* ========= MPESA ========= */
  mpesaAmount && mpesaAmount.addEventListener("input", () => {
    const amt = Number(mpesaAmount.value);
    if (amt >= 3) {
      const c = calc(amt);
      mpesaFee.textContent = c.fee;
      mpesaReceive.textContent = Math.floor(c.net * RATE);
    }
  });

  /* ========= SUMMARY ========= */
  function showSummary(method, account, amount, receive, fee) {
    summaryMethod.textContent = method;
    summaryAccount.textContent = account;
    summaryAmount.textContent = amount;
    summaryFee.textContent = fee;
    summaryReceive.textContent = receive;
    withdrawSummary.classList.remove("hidden");
  }

  /* ========= CONFIRM PAYPAL ========= */
  confirmPaypal && confirmPaypal.onclick = () => {
    const amt = Number(paypalAmount.value);
    if (amt < 3 || !paypalEmail.value) return alert("Invalid PayPal details");

    const c = calc(amt);
    showSummary("PayPal", paypalEmail.value, amt, `$${c.net}`, c.fee);
    paypalModal.classList.add("hidden");
  };

  /* ========= CONFIRM MPESA ========= */
  confirmMpesa && confirmMpesa.onclick = () => {
    const amt = Number(mpesaAmount.value);
    if (amt < 3 || !mpesaName.value || !mpesaNumber.value) {
      return alert("Invalid M-Pesa details");
    }

    const c = calc(amt);
    showSummary(
      "M-Pesa",
      `${mpesaName.value} (${mpesaNumber.value})`,
      amt,
      `KES ${Math.floor(c.net * RATE)}`,
      c.fee
    );
    mpesaModal.classList.add("hidden");
  };

  /* ========= FINAL ========= */
  withdrawBtn && withdrawBtn.onclick = () => {
    pendingText.classList.remove("hidden");
    withdrawBtn.disabled = true;
  };

});
