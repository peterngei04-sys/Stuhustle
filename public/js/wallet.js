========== */
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

const paypalBtn = document.getElementById("paypalBtn");
const mpesaBtn = document.getElementById("mpesaBtn");

const paypalModal = document.getElementById("paypalModal");
const mpesaModal = document.getElementById("mpesaModal");

const closePaypal = document.getElementById("closePaypal");
const closeMpesa = document.getElementById("closeMpesa");

const paypalEmail = document.getElementById("paypalEmail");
const paypalAmount = document.getElementById("paypalAmount");
const paypalFee = document.getElementById("paypalFee");
const paypalReceive = document.getElementById("paypalReceive");
const confirmPaypal = document.getElementById("confirmPaypal");

const mpesaName = document.getElementById("mpesaName");
const mpesaNumber = document.getElementById("mpesaNumber");
const mpesaAmount = document.getElementById("mpesaAmount");
const mpesaFee = document.getElementById("mpesaFee");
const mpesaReceive = document.getElementById("mpesaReceive");
const confirmMpesa = document.getElementById("confirmMpesa");

const withdrawSummary = document.getElementById("withdrawSummary");
const withdrawBtn = document.getElementById("withdrawBtn");
const pendingText = document.getElementById("pendingText");

const summaryMethod = document.getElementById("summaryMethod");
const summaryAccount = document.getElementById("summaryAccount");
const summaryAmount = document.getElementById("summaryAmount");
const summaryFee = document.getElementById("summaryFee");
const summaryReceive = document.getElementById("summaryReceive");

/* ===========================
   SIDEBAR (HAMBURGER)
=========================== */
menuBtn.addEventListener("click", () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
});

/* ===========================
   MODALS
=========================== */
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

/* ===========================
   CALCULATIONS
=========================== */
const RATE = 150;
const FEE = 0.07;

function calc(amount) {
  const fee = amount * FEE;
  return {
    fee: fee.toFixed(2),
    net: (amount - fee).toFixed(2)
  };
}

/* ===========================
   PAYPAL INPUT
=========================== */
paypalAmount.addEventListener("input", () => {
  const amt = Number(paypalAmount.value);
  if (amt >= 3) {
    const c = calc(amt);
    paypalFee.textContent = c.fee;
    paypalReceive.textContent = c.net;
  }
});

/* ===========================
   MPESA INPUT
=========================== */
mpesaAmount.addEventListener("input", () => {
  const amt = Number(mpesaAmount.value);
  if (amt >= 3) {
    const c = calc(amt);
    mpesaFee.textContent = c.fee;
    mpesaReceive.textContent = Math.floor(c.net * RATE);
  }
});

/* ===========================
   SUMMARY
=========================== */
function showSummary(method, account, amount, receive, fee) {
  summaryMethod.textContent = method;
  summaryAccount.textContent = account;
  summaryAmount.textContent = amount;
  summaryFee.textContent = fee;
  summaryReceive.textContent = receive;

  withdrawSummary.classList.remove("hidden");
}

/* ===========================
   PAYPAL CONFIRM
=========================== */
confirmPaypal.addEventListener("click", () => {
  const amt = Number(paypalAmount.value);
  if (amt < 3 || !paypalEmail.value) {
    alert("Enter valid PayPal details");
    return;
  }

  const c = calc(amt);
  showSummary("PayPal", paypalEmail.value, amt, `$${c.net}`, c.fee);
  paypalModal.classList.add("hidden");
});

/* ===========================
   MPESA CONFIRM
=========================== */
confirmMpesa.addEventListener("click", () => {
  const amt = Number(mpesaAmount.value);

  if (amt < 3 || !mpesaName.value || !mpesaNumber.value) {
    alert("Enter full M-Pesa details");
    return;
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
});

/* ===========================
   FINAL WITHDRAW
=========================== */
withdrawBtn.addEventListener("click", () => {
  pendingText.classList.remove("hidden");
  withdrawBtn.disabled = true;
});
