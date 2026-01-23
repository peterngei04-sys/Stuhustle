const db = firebase.firestore();
const auth = firebase.auth();
const id = new URLSearchParams(window.location.search).get("id");

const box = document.getElementById("details");

db.collection("account_listings").doc(id).get().then(doc => {
  const a = doc.data();

  box.innerHTML = `
    <h2>${a.service} - ${a.plan}</h2>
    <p>${a.description}</p>
    <p><strong>Price:</strong> $${a.price}</p>

    <button id="payBtn" class="btn-primary">Pay to Unlock Contact</button>
    <p id="contact" style="display:none;">Contact: Hidden until payment</p>
  `;

  document.getElementById("payBtn").onclick = () => {
    alert("Escrow payment logic goes here");
    document.getElementById("contact").style.display = "block";
  };
});

/* Hamburger */
menuBtn.onclick = () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};
