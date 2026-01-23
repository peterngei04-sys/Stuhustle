onst auth = firebase.auth();
const db = firebase.firestore();

const postGigForm = document.getElementById("postGigForm");
const gigMessage = document.getElementById("gigMessage");
const gigsContainer = document.getElementById("gigsContainer");

// Post a gig
postGigForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("gigTitle").value.trim();
  const category = document.getElementById("gigCategory").value.trim();
  const description = document.getElementById("gigDescription").value.trim();
  const skills = document.getElementById("gigSkills").value.trim().split(",");
  const price = parseFloat(document.getElementById("gigPrice").value);
  const delivery = parseInt(document.getElementById("gigDelivery").value);

  const user = auth.currentUser;
  if (!user) {
    gigMessage.textContent = "You must be logged in to post a gig.";
    return;
  }

  try {
    await db.collection("freelance_gigs").add({
      userId: user.uid,
      title,
      category,
      description,
      skills,
      price,
      delivery,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    gigMessage.textContent = "Gig posted successfully!";
    postGigForm.reset();
    loadGigs();
  } catch (error) {
    gigMessage.textContent = "Error posting gig: " + error.message;
  }
});

// Load gigs from Firestore
async function loadGigs() {
  gigsContainer.innerHTML = "";
  const snapshot = await db.collection("freelance_gigs").orderBy("createdAt", "desc").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const gigCard = document.createElement("div");
    gigCard.classList.add("gig-card");
    gigCard.innerHTML = `
      <h3>${data.title}</h3>
      <p>Category: ${data.category}</p>
      <p>Skills: ${data.skills.join(", ")}</p>
      <p>Price: $${data.price}</p>
      <p>Delivery: ${data.delivery} days</p>
    `;
    gigCard.addEventListener("click", () => {
      window.location.href = `gig-details.html?gigId=${doc.id}`;
    });
    gigsContainer.appendChild(gigCard);
  });
}

// Initial load
auth.onAuthStateChanged(user => {
  if (user) {
    loadGigs();
  } else {
    gigsContainer.innerHTML = "<p>Please log in to see gigs.</p>";
  }
});
