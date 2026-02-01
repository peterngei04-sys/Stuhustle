// ==============================
// Firebase imports assumed already loaded in HTML
// ==============================

// Global state
let currentUser = null;
let userCountry = "";

// ==============================
// Toast helper (NO alerts)
// ==============================
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, duration);
}

// ==============================
// DOM Ready
// ==============================
document.addEventListener("DOMContentLoaded", () => {

  // ---------- ELEMENTS ----------
  const mpesaBtn = document.getElementById("mpesaBtn");
  const paypalBtn = document.getElementById("paypalBtn");
  const mpesaModal = document.getElementById("mpesaModal");
  const paypalModal = document.getElementById("paypalModal");
  const withdrawBtn = document.getElementById("finalWithdrawBtn");

  // Safety checks (prevents silent crashes)
  if (!mpesaBtn || !paypalBtn) {
    console.warn("Withdrawal buttons not found");
    return;
  }

  // ==============================
  // AUTH STATE
  // ==============================
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) return;

    currentUser = user;

    try {
      const snap = await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .get();

      if (!snap.exists) return;

      // ✅ BULLETPROOF country normalization
      userCountry = (snap.data()?.country || "")
        .toString()
        .trim()
        .toLowerCase();

      console.log("User country:", userCountry);

    } catch (err) {
      console.error("Country fetch error:", err);
    }
  });

  // ==============================
  // BUTTON HANDLERS
  // ==============================

  // ---- M-PESA ----
  mpesaBtn.onclick = () => {
    if (userCountry !== "kenya") {
      showToast("M-Pesa withdrawals are only available in Kenya 🇰🇪");
      return;
    }
    mpesaModal?.classList.remove("hidden");
  };

  // ---- PAYPAL ----
  paypalBtn.onclick = () => {
    paypalModal?.classList.remove("hidden");
  };

  // ==============================
  // FINAL WITHDRAW
  // ==============================
  withdrawBtn?.addEventListener("click", async () => {

    if (!currentUser) {
      showToast("Please log in again");
      return;
    }

    const amountInput = document.getElementById("withdrawAmount");
    const amount = Number(amountInput?.value || 0);

    if (amount < 3) {
      showToast("Minimum withdrawal is $3");
      return;
    }

    try {
      await firebase.firestore().collection("withdrawals").add({
        uid: currentUser.uid,
        amount,
        method: mpesaModal && !mpesaModal.classList.contains("hidden")
          ? "mpesa"
          : "paypal",
        status: "pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showToast("Withdrawal submitted successfully ⏳");

      mpesaModal?.classList.add("hidden");
      paypalModal?.classList.add("hidden");
      amountInput.value = "";

    } catch (err) {
      console.error(err);
      showToast("Something went wrong. Try again.");
    }
  });

});
