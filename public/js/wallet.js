const auth = firebase.auth();
const db = firebase.firestore();

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

const withdrawBtn = document.getElementById("withdrawBtn");
const withdrawCard = document.getElementById("withdrawCard");
const method = document.getElementById("method");
const paypalBox = document.getElementById("paypalBox");
const mpesaBox = document.getElementById("mpesaBox");

withdrawBtn.onclick = () => {
  withdrawCard.style.display = "block";
};

method.onchange = () => {
  paypalBox.style.display = method.value === "paypal" ? "block" : "none";
  mpesaBox.style.display = method.value === "mpesa" ? "block" : "none";
};

document.getElementById("amount").oninput = e => {
  const amt = Number(e.target.value);
  if (amt < 3) return;
  const fee = amt * 0.05;
  document.getElementById("fee").innerText = `$${fee.toFixed(2)}`;
  document.getElementById("receive").innerText = `$${(amt - fee).toFixed(2)}`;
};

auth.onAuthStateChanged(user => {
  if (!user) return location.href = "login.html";

  if (!user.emailVerified) {
    document.getElementById("verifyBox").style.display = "block";
    withdrawBtn.disabled = true;
  }

  document.getElementById("resendVerify")?.addEventListener("click", () => {
    user.sendEmailVerification();
    alert("Verification email sent");
  });
});
