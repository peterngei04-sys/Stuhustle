document.addEventListener("DOMContentLoaded", () => {

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

  document.querySelectorAll(".close").forEach(btn => {
    btn.onclick = () => {
      paypalModal.classList.add("hidden");
      mpesaModal.classList.add("hidden");
    };
  });

  const RATE = 150, FEE = 0.07;

  paypalAmount.oninput = () => {
    let a = +paypalAmount.value;
    if (a >= 3) {
      paypalFee.textContent = (a * FEE).toFixed(2);
      paypalReceive.textContent = (a - a * FEE).toFixed(2);
    }
  };

  mpesaAmount.oninput = () => {
    let a = +mpesaAmount.value;
    if (a >= 3) {
      mpesaFee.textContent = (a * FEE).toFixed(2);
      mpesaReceive.textContent = Math.floor((a - a * FEE) * RATE);
    }
  };

});
