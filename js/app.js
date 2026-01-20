// Get elements
const nameInput = document.getElementById("name");
const serviceInput = document.getElementById("service");
const priceInput = document.getElementById("price");
const whatsappInput = document.getElementById("whatsapp");
const postBtn = document.getElementById("postBtn");
const hustleList = document.getElementById("hustleList");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

// Load hustles from localStorage
let hustles = JSON.parse(localStorage.getItem("hustles")) || [];

// Save to localStorage
function saveHustles() {
  localStorage.setItem("hustles", JSON.stringify(hustles));
}

// Render hustles with optional filtering and sorting
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

  hustleList.innerHTML = "";

  filteredHustles.forEach((hustle, index) => {
    const div = document.createElement("div");
    div.className = "hustle-item";

    div.innerHTML = `
      <h3>${hustle.name}</h3>
      <p><strong>Service:</strong> ${hustle.service}</p>
      <p><strong>Price:</strong> ${hustle.price || 'Not specified'}</p>
      <div class="actions">
        <a class="whatsapp-btn" href="https://wa.me/${hustle.whatsapp}" target="_blank">
          <i class="fab fa-whatsapp"></i> WhatsApp
        </a>
        <button class="delete-btn" onclick="deleteHustle(${index})">
          <i class="fas fa-trash-alt"></i> Delete
        </button>
      </div>
    `;

    hustleList.appendChild(div);
  });
}

// Add hustle
postBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const service = serviceInput.value.trim();
  const price = priceInput.value.trim();
  const whatsapp = whatsappInput.value.trim();

  if (!name || !service || !whatsapp) {
    alert("Please fill required fields");
    return;
  }

  hustles.unshift({ name, service, price, whatsapp });
  saveHustles();
  renderHustles();

  nameInput.value = "";
  serviceInput.value = "";
  priceInput.value = "";
  whatsappInput.value = "";
});

// Delete hustle
function deleteHustle(index) {
  if (!confirm("Delete this hustle?")) return;

  hustles.splice(index, 1);
  saveHustles();
  renderHustles();
}

// Search input listener
searchInput.addEventListener("input", renderHustles);

// Sort select listener
sortSelect.addEventListener("change", renderHustles);

// Initial render
renderHustles();
