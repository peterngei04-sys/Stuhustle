const auth = firebase.auth();
const db = firebase.firestore();

const adForm = document.getElementById("adForm");
const adMsg = document.getElementById("adMsg");

/* Ensure Logged In */
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  }
});

/* Submit Ad */
adForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const adData = {
    advertiserName: advertiserName.value.trim(),
    businessName: businessName.value.trim(),
    adTitle: adTitle.value.trim(),
    adDescription: adDescription.value.trim(),
    adLink: adLink.value.trim(),
    budget: Number(budget.value),
    duration: Number(duration.value),
    status: "pending", // IMPORTANT
    userId: user.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("ads").add(adData);

    adMsg.style.color = "var(--secondary)";
    adMsg.textContent =
      "Ad submitted successfully. Awaiting approval.";

    adForm.reset();

  } catch (error) {
    adMsg.style.color = "#ef4444";
    adMsg.textContent = error.message;
  }
});
