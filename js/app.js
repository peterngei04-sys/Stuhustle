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

// Load hustles from localStorage
let hustles = JSON.parse(localStorage.getItem("hustles")) || [];

// Save to localStorage
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

  // Filter by search input
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filteredHustles = hustles.filter(hustle =>
      hustle.name.toLowerCase().includes(searchTerm) ||
      hustle.service.toLowerCase().includes(searchTerm)
    );
  }

  // Sort
  if (sortSelect.value === "oldest") {
    filteredHustles = filteredHustles.slice().reverse();
  }

  // Featured hustles first
  filteredHustles.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  hustleList.innerHTML = "";

  filteredHustles.forEach((hustle, index) => {
    const div = document.createElement("div");
    div.className = "hustle-item";
    if (hustle.featured) div.classList.add("featured");

    // Encode text for social sharing
    const text = encodeURIComponent(
      `Check out this hustle: ${hustle.name} - ${hustle.service}. Price: ${hustle.price || 'Not specified'}`
    );
    const url = encodeURIComponent(window.location.href);

    div.innerHTML = `
      <h3>${hustle.name} ${hustle.featured ? '⭐' : ''}</h3>
      <p><strong>Service:</strong> ${hustle.service}</p>
      <p><strong>Price:</strong> ${hustle.price || 'Not specified'}</p>
      <div class="actions">
        <a class="whatsapp-btn" href="https://wa.me/${hustle.whatsapp}" target="_blank">
          <i class="fab fa-whatsapp"></i> WhatsApp
        </a>
        <a class="whatsapp-btn" href="https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}" target="_blank">
          <i class="fab fa-facebook-f"></i> Facebook
        </a>
        <a class="whatsapp-btn" href="https://twitter.com/intent/tweet?text=${text}&url=${url}" target="_blank">
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

// Search and sort listeners
searchInput.addEventListener("input", renderHustles);
sortSelect.addEventListener("change", renderHustles);

// Initial render
renderHustles();
