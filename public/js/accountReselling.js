const db = firebase.firestore();
const auth = firebase.auth();

const postBtn = document.getElementById("postAccountBtn");
const list = document.getElementById("accountsList");
const searchInput = document.getElementById("searchInput");

/* ===== POST ACCOUNT ===== */
postBtn.addEventListener("click", () => {
  const user = auth.currentUser;
  if (!user) return alert("Login required");

  const data = {
    service: service.value,
    plan: plan.value,
    price: Number(price.value),
    description: description.value,
    sellerId: user.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection("account_listings").add(data)
    .then(() => alert("Account posted"))
    .catch(err => alert(err.message));
});

/* ===== LOAD ACCOUNTS ===== */
db.collection("account_listings")
  .orderBy("createdAt", "desc")
  .onSnapshot(snapshot => {
    list.innerHTML = "";
    snapshot.forEach(doc => renderAccount(doc.id, doc.data()));
  });

function renderAccount(id, a) {
  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <h3>${a.service} - ${a.plan}</h3>
    <p>$${a.price}</p>
    <a href="account-details.html?id=${id}" class="btn-outline">View</a>
  `;
  list.appendChild(div);
}

/* ===== SEARCH ===== */
searchInput.addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll(".card").forEach(c => {
    c.style.display = c.innerText.toLowerCase().includes(term) ? "block" : "none";
  });
});

/* ===== HAMBURGER ===== */
menuBtn.onclick = () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};
