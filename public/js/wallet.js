const auth = firebase.auth();
const db = firebase.firestore();

/* ===== HAMBURGER ===== */
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

/* ===== MODAL ===== */
const withdrawModal = document.getElementById("withdrawModal");
document.getElementById("openWithdraw").onclick = () => {
  withdrawModal.classList.add("show");
};

document.getElementById("closeWithdraw").onclick = () => {
  withdrawModal.classList.remove("show");
};

/* ===== WALLET DATA ===== */
auth.onAuthStateChanged(user => {
  if (!user) return location.href = "login.html";

  const uid = user.uid;

  db.collection("wallets").doc(uid).onSnapshot(doc => {
    if (!doc.exists) return;

    const data = doc.data();
    document.getElementById("availableBalance").innerText = `KES ${data.available || 0}`;
    document.getElementById("pendingBalance").innerText = `KES ${data.pending || 0}`;
    document.getElementById("escrowBalance").innerText = `KES ${data.escrow || 0}`;
  });

  db.collection("transactions")
    .where("userId", "==", uid)
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {
      const list = document.getElementById("transactionList");
      list.innerHTML = "";

      snapshot.forEach(doc => {
        const t = doc.data();
        list.innerHTML += `
          <li>${t.type} — KES ${t.amount} (${t.status})</li>
        `;
      });
    });
});

/* ===== WITHDRAW ===== */
document.getElementById("withdrawAmount").oninput = e => {
  const fee = Math.floor(e.target.value * 0.05);
  document.getElementById("feeAmount").innerText = fee;
};

document.getElementById("confirmWithdraw").onclick = () => {
  alert("Withdrawal request submitted (backend logic later)");
};
