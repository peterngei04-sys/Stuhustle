// ===== MENU =====
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuBtn.onclick = () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};

// ===== AUTH CHECK =====
firebase.auth().onAuthStateChanged(user => {
  if (!user) window.location.href = "login.html";
});

// ===== DEMO DATA =====
const listings = [
  {
    title: "Laundry Services",
    desc: "Affordable laundry services for students",
    price: 300,
    location: "Hostels"
  },
  {
    title: "Phone Repair",
    desc: "Screen replacement and battery fix",
    price: 1500,
    location: "Town"
  }
];

const grid = document.getElementById("localGrid");

function render(data) {
  grid.innerHTML = "";
  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "local-card";
    div.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      <p class="location">${item.location}</p>
      <p class="price">KES ${item.price}</p>
      <button class="btn-outline">Contact</button>
    `;
    grid.appendChild(div);
  });
}

render(listings);

// ===== SEARCH =====
document.getElementById("searchBtn").onclick = () => {
  const term = document.getElementById("searchInput").value.toLowerCase();
  const filtered = listings.filter(l =>
    l.title.toLowerCase().includes(term) ||
    l.location.toLowerCase().includes(term)
  );
  render(filtered);
};
