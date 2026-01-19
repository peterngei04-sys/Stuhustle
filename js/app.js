const form = document.getElementById("hustleForm");
const hustleList = document.getElementById("hustleList");

let hustles = JSON.parse(localStorage.getItem("hustles")) || [];

/* Load hustles on page load */
function renderHustles() {
    hustleList.innerHTML = "";
    hustles.forEach((hustle, index) => {
        const card = document.createElement("div");
        card.className = "hustle-card";

        card.innerHTML = `
            <h3>${hustle.service}</h3>
            <p><strong>By:</strong> ${hustle.name}</p>
            <p><strong>Price:</strong> ${hustle.price || "Negotiable"}</p>
            <a class="whatsapp-btn" href="https://wa.me/${hustle.whatsapp}" target="_blank">
                Contact on WhatsApp
            </a>
        `;

        hustleList.appendChild(card);
    });
}

/* Save hustles to localStorage */
function saveHustles() {
    localStorage.setItem("hustles", JSON.stringify(hustles));
}

/* Handle form submit */
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const service = document.getElementById("service").value.trim();
    const price = document.getElementById("price").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();

    if (!name || !service || !whatsapp) {
        alert("Please fill in all required fields.");
        return;
    }

    const newHustle = {
        name,
        service,
        price,
        whatsapp
    };

    hustles.unshift(newHustle);
    saveHustles();
    renderHustles();
    form.reset();
});

/* Initial render */
renderHustles();
