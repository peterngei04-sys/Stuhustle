// Get elements
const nameInput = document.getElementById("name");
const serviceInput = document.getElementById("service");
const priceInput = document.getElementById("price");
const whatsappInput = document.getElementById("whatsapp");
const postBtn = document.getElementById("postBtn");
const hustleList = document.getElementById("hustleList");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const featuredCheckbox = document.getElementById("featured");
const totalHustlesSpan = document.getElementById("totalHustles");
const featuredHustlesSpan = document.getElementById("featuredHustles");
const darkModeToggle = document.getElementById("darkModeToggle");

// Load hustles
let hustles = JSON.parse(localStorage.getItem("hustles")) || [];

// Save hustles
function saveHustles() {
  localStorage.setItem("hustles", JSON.stringify(hustles));
}

// Update counters
function updateCounters() {
  totalHustlesSpan.textContent = `Total Hustles: ${hustles.length}`;
  const featuredCount = hustles.filter(h => h.featured).length;
  featuredHustlesSpan.textContent = `Featured: ${featuredCount}`;
}

// Render hustles
function renderHustles() {
  let filteredHustles = hustles;

  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filteredHustles = hustles.filter(h =>
      h.name.toLowerCase().includes(searchTerm) ||
      h.service.toLowerCase().includes(searchTerm)
    );
  }

  if (sortSelect.value === "oldest") filteredHustles = filteredHustles.slice().reverse();

  filteredHustles.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  hustleList.innerHTML = "";

  filteredHustles.forEach((hustle, index) => {
    const div = document.createElement("div");
    div.className = "hustle-item";
    if (hustle.featured) div.classList.add("featured");

    const text = encodeURIComponent(
      `Check out this hustle: ${hustle.name} - ${hustle.service}. Price: ${hustle.price || 'Not specified'}`
    );
    const url = encodeURIComponent(window.location.href);

    div.innerHTML = `
      <h3>${hustle.name} ${hustle.featured ? '⭐' : ''}</h3>
      <p><strong>Service:</strong> ${hustle.service}</p>
      <p><strong>Price:</strong> ${hustle.price || 'Not specified'}</p>
      <div class="actions">
        <a class="social-btn whatsapp-btn" href="https://wa.me/${hustle.whatsapp}" target="_blank">
          <i class="fab fa-whatsapp"></i> WhatsApp
        </a>
        <a class="social-btn" href="https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}" target="_blank">
          <i class="fab fa-facebook-f"></i> Facebook
        </a>
        <a class="social-btn" href="https://twitter.com/intent/tweet?text=${text}&url=${url}" target="_blank">
          <i class="fab fa-twitter"></i> Twitter
        </a>
        <button class="delete-btn" onclick="deleteHustle(${index})">
          <i class="fas fa-trash-alt"></i> Delete
        </button>
      </div>
    `;
    hustleList.appendChild(div);
  });

  updateCounters();
}

// Add hustle
postBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const service = serviceInput.value.trim();
  const price = priceInput.value.trim();
  const whatsapp = whatsappInput.value.trim();
  const featured = featuredCheckbox.checked;

  if (!name || !service || !whatsapp) {
    alert("Please fill required fields");
    return;
  }

  hustles.unshift({ name, service, price, whatsapp, featured });
  saveHustles();
  renderHustles();

  nameInput.value = "";
  serviceInput.value = "";
  priceInput.value = "";
  whatsappInput.value = "";
  featuredCheckbox.checked = false;
});

// Delete hustle
function deleteHustle(index) {
  if (!confirm("Delete this hustle?")) return;
  hustles.splice(index, 1);
  saveHustles();
  renderHustles();
}

// Search & sort
searchInput.addEventListener("input", renderHustles);
sortSelect.addEventListener("change", renderHustles);

// Dark mode toggle
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
  } else {
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
  }
});

// Initial render
renderHustles();

