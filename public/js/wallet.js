ocument.addEventListener("DOMContentLoaded", () => {

  const RATE = 150;
  const FEE = 0.07;

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.getElementById("menuBtn");

  menuBtn.onclick = () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  };

  overlay.onclick = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  };

  const paypalModal = document.getElementById("paypalModal");
  const mpesaModal = document.getElementById("mpesaModal");

  document.getElementById("paypalBtn").onclick = () => paypalModal.classList.remove("hidden");
  document.getElementById("mpesaBtn").onclick = () => mpesaModal.classList.remove("hidden");

  document.getElementById("closePaypal").onclick = () => paypalModal.classList.add("hidden");
  document.getElementById("closeMpesa").onclick = () => mpesaModal.classList.add("hidden");

  const paypalAmount = document.getElementById("paypalAmount");
  const paypalFee = document.getElementById("paypalFee");
  const paypalReceive = document.getElementById("paypalReceive");

  paypalAmount.oninput = () => {
    const amt = Number(paypalAmount.value);
    if (amt >= 3) {
      const fee = amt * FEE;
      paypalFee.textContent = fee.toFixed(2);
      paypalReceive.textContent = (amt - fee).toFixed(2);
    }
  };

  const mpesaAmount = document.getElementById("mpesaAmount");
  const mpesaFee = document.getElementById("mpesaFee");
  const mpesaReceive = document.getElementById("mpesaReceive");

  mpesaAmount.oninput = () => {
    const amt = Number(mpesaAmount.value);
    if (amt >= 3) {
      const fee = amt * FEE;
      mpesaFee.textContent = fee.toFixed(2);
      mpesaReceive.textContent = Math.floor((amt - fee) * RATE);
    }
  };

  // 🔥 FIREBASE BALANCE
  firebase.auth().onAuthStateChanged(user => {
    if (!user) return location.href = "login.html";

    firebase.firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot(doc => {
        document.getElementById("balance").textContent =
          `$${(doc.data()?.balance || 0).toFixed(2)}`;
      });
  });

});
