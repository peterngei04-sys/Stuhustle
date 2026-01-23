const form = document.getElementById("digitalForm");
const statusMsg = document.getElementById("statusMsg");

const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const productData = {
    uid: user.uid,
    title: document.getElementById("title").value,
    category: document.getElementById("category").value,
    description: document.getElementById("description").value,
    price: Number(document.getElementById("price").value),
    deliveryLink: document.getElementById("deliveryLink").value,
    status: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("digital_products").add(productData);
    statusMsg.textContent = "✅ Product submitted for review";
    statusMsg.style.color = "#22c55e";
    form.reset();
  } catch (err) {
    statusMsg.textContent = "❌ Error submitting product";
    statusMsg.style.color = "#ef4444";
    console.error(err);
  }
});
