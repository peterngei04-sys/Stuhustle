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
