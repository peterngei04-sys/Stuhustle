// js/gig-detail.js

// DO NOT redeclare auth or db here

const params = new URLSearchParams(window.location.search);
const gigId = params.get("id");

const gigContainer = document.getElementById("gigDetails");
const bidsContainer = document.getElementById("bidsContainer");

if (!gigId) {
  gigContainer.innerHTML = "<p>Invalid gig.</p>";
} else {
  db.collection("freelance_gigs").doc(gigId).get()
    .then(doc => {
      if (!doc.exists) {
        gigContainer.innerHTML = "<p>Gig not found.</p>";
        return;
      }

      const gig = doc.data();

      gigContainer.innerHTML = `
        <h2>${gig.title}</h2>
        <p>${gig.description}</p>
        <p><strong>Budget:</strong> $${gig.budget}</p>
        <p><strong>Qualifications:</strong> ${gig.qualifications}</p>
      `;

      loadBids(gigId);
    })
    .catch(err => {
      console.error(err);
      gigContainer.innerHTML = "<p>Error loading gig.</p>";
    });
}

function loadBids(gigId) {
  db.collection("freelance_gigs")
    .doc(gigId)
    .collection("bids")
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {
      bidsContainer.innerHTML = "";

      if (snapshot.empty) {
        bidsContainer.innerHTML = "<p>No bids yet.</p>";
        return;
      }

      snapshot.forEach(doc => {
        const bid = doc.data();
        bidsContainer.innerHTML += `
          <div class="bid-card">
            <p><strong>$${bid.amount}</strong></p>
            <p>${bid.message}</p>
          </div>
        `;
      });
    });
}
