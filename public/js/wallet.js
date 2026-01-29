// SIDEBAR
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuBtn.onclick = () => {
  sidebar.style.left = "0";
  overlay.style.display = "block";
};

overlay.onclick = () => {
  sidebar.style.left = "-260px";
  overlay.style.display = "none";
};

// MODAL
const openFormBtn = document.getElementById("openFormBtn");
const modal = document.getElementById("withdrawModal");
const cancelForm = document.getElementById("cancelForm");

openFormBtn.onclick = () => modal.style.display = "flex";
cancelForm.onclick = () => modal.style.display = "none";

// CONFIRM DETAILS
document.getElementById("confirmDetails").onclick = () => {
  const method = document.getElementById("method").value;
  const account = document.getElementById("account").value;
  const amount = document.getElementById("amount").value;

  if (!method || !account || !amount) {
    alert("Fill all fields");
    return;
  }

  document.getElementById("showMethod").innerText = method;
  document.getElementById("showAccount").innerText = account;
  document.getElementById("showAmount").innerText = `$${amount}`;

  document.getElementById("withdrawBtn").disabled = false;
  modal.style.display = "none";
};

// WITHDRAW ACTION
document.getElementById("withdrawBtn").onclick = () => {
  document.getElementById("statusText").innerText =
    "⏳ Withdrawal pending (24 hours)";
  document.getElementById("withdrawBtn").disabled = true;
};
