// Get elements
const nameInput = document.getElementById("name");
const serviceInput = document.getElementById("service");
const priceInput = document.getElementById("price");
const whatsappInput = document.getElementById("whatsapp");
const postBtn = document.getElementById("postBtn");
const hustleList = document.getElementById("hustleList");

// Load hustles from localStorage
let hustles = JSON.parse(localStorage.getItem("hustles")) || [];

// Save to localStorage
function saveHustles() {
  localStorage.setItem("hustles", JSON.stringify(hustles));
}

// Render hustles
function renderHustles() {
  hustleList.innerHTML = "";

  hustles.forEach((hustle, index) => {
    const div = document.createElement("div");
    div.className = "hustle-item";

    div.innerHTML = `
      <h3>${hustle.name}</h3>
      <p><strong>Service:</strong> ${hustle.service}</p>
      <p><strong>Price:</strong> ${hustle.price || 'Not specified'}</p>
      <div class="actions">
        <a class="whatsapp-btn" href="https://wa.me/${hustle.whatsapp}" target="_blank">
          WhatsApp
        </a>
        <button class="delete-btn" onclick="deleteHustle(${index})">
          Delete
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

// Initial render
renderHustles();
