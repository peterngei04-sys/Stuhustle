document.addEventListener("DOMContentLoaded", () => {

  /* ===== SIDEBAR ===== */
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  menuBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  });

  /* ===== MODALS ===== */
  const paypalModal = document.getElementById("paypalModal");
  const mpesaModal = document.getElementById("mpesaModal");

  const paypalBtn = document.getElementById("paypalBtn");
  const mpesaBtn = document.getElementById("mpesaBtn");

  const closePaypal = document.getElementById("closePaypal");
  const closeMpesa = document.getElementById("closeMpesa");

  paypalBtn.addEventListener("click", () => {
    paypalModal.classList.remove("hidden");
  });

  mpesaBtn.addEventListener("click", () => {
    mpesaModal.classList.remove("hidden");
  });

  closePaypal.addEventListener("click", () => {
    paypalModal.classList.add("hidden");
  });

  closeMpesa.addEventListener("click", () => {
    mpesaModal.classList.add("hidden");
  });

  /* ===== CALCULATIONS ===== */
  const RATE = 150;
  const FEE = 0.07;

  const paypalAmount = document.getElementById("paypalAmount");
  const paypalFee = document.getElementById("paypalFee");
  const paypalReceive = document.getElementById("paypalReceive");

  const mpesaAmount = document.getElementById("mpesaAmount");
  const mpesaFee = document.getElementById("mpesaFee");
  const mpesaReceive = document.getElementById("mpesaReceive");

  function calc(amount) {
    const fee = amount * FEE;
    return {
      fee: fee.toFixed(2),
      net: (amount - fee).toFixed(2)
    };
  }

  paypalAmount.addEventListener("input", () => {
    const amt = Number(paypalAmount.value);
    if (amt >= 3) {
      const c = calc(amt);
      paypalFee.innerText = c.fee;
      paypalReceive.innerText = c.net;
    }
  });

  mpesaAmount.addEventListener("input", () => {
    const amt = Number(mpesaAmount.value);
    if (amt >= 3) {
      const c = calc(amt);
      mpesaFee.innerText = c.fee;
      mpesaReceive.innerText = Math.floor(c.net * RATE);
    }
  });

});
