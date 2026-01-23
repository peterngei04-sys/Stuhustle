const form = document.getElementById("dropshipForm");
const statusMsg = document.getElementById("statusMsg");

const db = firebase.firestore();
const auth = firebase.auth();

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const product = {
    uid: user.uid,
    name: document.getElementById("productName").value,
    description: document.getElementById("productDesc").value,
    price: Number(document.getElementById("productPrice").value),
    supplierLink: document.getElementById("supplierLink").value,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    status: "pending"
  };

  try {
    await db.collection("dropshipping_products").add(product);
    statusMsg.textContent = "✅ Product submitted successfully!";
    statusMsg.style.color = "#22c55e";
    form.reset();
  } catch (error) {
    statusMsg.textContent = "❌ Failed to submit product.";
    statusMsg.style.color = "#ef4444";
    console.error(error);
  }
});
