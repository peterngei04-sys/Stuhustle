const auth = firebase.auth();
const db = firebase.firestore();

const FX = 150;
const FEE = 0.05;
const MIN = 3;

let currentUser;
let draft = null;
let userCountry = "Kenya"; // fetch from profile later

auth.onAuthStateChanged(user => {
  if (!user) return location.href = "login.html";
  currentUser = user;

  if (!user.emailVerified) {
    document.getElementById("verifyBox").style.display = "block";
    document.getElementById("openWithdraw").disabled = true;
  }

  document.getElementById("availableBalance").innerText = "$25.00";
});

/* MODAL */
const modal = document.getElementById("withdrawModal");
document.getElementById("openWithdraw").onclick = () => modal.classList.add("show");
document.getElementById("closeWithdraw").onclick = () => modal.classList.remove("show");

/* METHOD SWITCH */
document.querySelectorAll(".method-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".method-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const m = btn.dataset.method;
    document.getElementById("paypalForm").style.display = m === "paypal" ? "block" : "none";
    document.getElementById("mpesaForm").style.display = m === "mpesa" ? "block" : "none";

    if (m === "mpesa" && userCountry !== "Kenya") {
      document.getElementById("mpesaNotice").style.display = "block";
    } else {
      document.getElementById("mpesaNotice").style.display = "none";
    }
  };
});

/* CONFIRM DETAILS */
document.getElementById("confirmWithdraw").onclick = () => {
  const method = document.querySelector(".method-btn.active").dataset.method;
  let amount;

  if (method === "paypal") {
    amount = Number(document.getElementById("paypalAmount").value);
    draft = {
      method,
      email: document.getElementById("paypalEmail").value
    };
  } else {
    amount = Number(document.getElementById("mpesaAmount").value);
    draft = {
      method,
      name: document.getElementById("mpesaName").value,
      phone: document.getElementById("mpesaPhone").value
    };
  }

  if (amount < MIN) {
    document.getElementById("withdrawError").innerText = "Minimum withdrawal is $3";
    return;
  }

  const fee = +(amount * FEE).toFixed(2);
  const net = +(amount - fee).toFixed(2);

  draft.amount = amount;
  draft.fee = fee;
  draft.net = net;

  modal.classList.remove("show");

  document.getElementById("withdrawReview").style.display = "block";
  document.getElementById("rMethod").innerText = method.toUpperCase();
  document.getElementById("rAmount").innerText = `$${amount}`;
  document.getElementById("rFee").innerText = `$${fee}`;
  document.getElementById("rReceive").innerText = `$${net}`;

  if (method === "mpesa") {
    document.getElementById("rExtra").innerHTML =
      `<p>You receive: KES ${Math.floor(net * FX)}</p>`;
  }
};

/* SUBMIT */
document.getElementById("submitWithdrawal").onclick = () => {
  db.collection("withdrawals").add({
    uid: currentUser.uid,
    ...draft,
    status: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("submitWithdrawal").disabled = true;
  document.getElementById("pendingText").style.display = "block";
};
