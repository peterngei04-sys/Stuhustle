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
      menuBtn.onclick = () => {
        sidebar.classList.add("open");
        overlay.classList.add("show");
      };
      overlay.onclick = () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
      };
    }

    /* ===== MODALS ===== */
    paypalBtn && (paypalBtn.onclick = () => paypalModal.classList.remove("hidden"));
    closePaypal && (closePaypal.onclick = () => paypalModal.classList.add("hidden"));

    closeMpesa && (closeMpesa.onclick = () => mpesaModal.classList.add("hidden"));

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

    /* ===== INPUT LISTENERS ===== */
    paypalAmount && paypalAmount.addEventListener("input", () => {
      const amt = Number(paypalAmount.value);
      if (amt >= 3) {
        const c = calc(amt);
        paypalFee.textContent = c.fee;
        paypalReceive.textContent = c.net;
      }
    });

    mpesaAmount && mpesaAmount.addEventListener("input", () => {
      const amt = Number(mpesaAmount.value);
      if (amt >= 3) {
        const c = calc(amt);
        mpesaFee.textContent = c.fee;
        mpesaReceive.textContent = Math.floor(c.net * RATE);
      }
    });

    /* ===== SUMMARY ===== */
    function showSummary(method, account, amount, receive, fee) {
      summaryMethod.textContent = method;
      summaryAccount.textContent = account;
      summaryAmount.textContent = amount;
      summaryFee.textContent = fee;
      summaryReceive.textContent = receive;
      withdrawSummary.classList.remove("hidden");
    }

    confirmPaypal && (confirmPaypal.onclick = () => {
      const amt = Number(paypalAmount.value);
      if (amt < 3) return alert("Minimum withdrawal is $3");
      if (!paypalEmail.value) return alert("Enter PayPal email");

      const c = calc(amt);
      showSummary("PayPal", paypalEmail.value, amt, `$${c.net}`, c.fee);
      paypalModal.classList.add("hidden");
    });

    confirmMpesa && (confirmMpesa.onclick = () => {
      const amt = Number(mpesaAmount.value);
      if (amt < 3) return alert("Minimum withdrawal is $3");
      if (!mpesaNumber.value || !mpesaName.value)
        return alert("Enter M-Pesa name and number");

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

    /* ===== AUTH + COUNTRY LOCK ===== */
    firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) return;

      const doc = await firebase.firestore().collection("users").doc(user.uid).get();
      const country = (doc.data()?.country || "").toLowerCase();

      mpesaBtn.onclick = () => {
        if (country !== "kenya") {
          alert("M-Pesa is only available in Kenya 🇰🇪");
          return;
        }
        mpesaModal.classList.remove("hidden");
      };
    });

    /* ===== FINAL WITHDRAW (FIXED) ===== */
    withdrawBtn.addEventListener("click", async () => {
      console.log("Withdraw clicked");

      const user = firebase.auth().currentUser;
      if (!user) return alert("Please log in again");

      if (!summaryMethod.textContent)
        return alert("Select a withdrawal method first");

      withdrawBtn.disabled = true;
      withdrawBtn.textContent = "Processing...";

      try {
        await firebase.firestore().collection("withdrawals").add({
          userId: user.uid,
          method: summaryMethod.textContent,
          account: summaryAccount.textContent,
          amountUSD: Number(summaryAmount.textContent),
          feeUSD: Number(summaryFee.textContent),
          receive: summaryReceive.textContent,
          status: "pending",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Withdrawal submitted ⏳");
        withdrawBtn.textContent = "Withdraw";
      } catch (err) {
        console.error(err);
        alert("Withdrawal failed");
        withdrawBtn.disabled = false;
        withdrawBtn.textContent = "Withdraw";
      }
    });

  });

})();
