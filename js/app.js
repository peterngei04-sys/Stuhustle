const form = document.getElementById("hustleForm");
const hustleList = document.getElementById("hustleList");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const service = document.getElementById("service").value;
    const price = document.getElementById("price").value;
    const whatsapp = document.getElementById("whatsapp").value;

    // Create hustle card
    const card = document.createElement("div");
    card.className = "hustle-card";

    card.innerHTML = `
        <h3>${service}</h3>
        <p><strong>By:</strong> ${name}</p>
        <p><strong>Price:</strong> ${price || "Negotiable"}</p>
        <a class="whatsapp-btn" href="https://wa.me/${whatsapp}" target="_blank">
            Contact on WhatsApp
        </a>
    `;

    // Add to the top of the list
    hustleList.prepend(card);

    // Reset form
    form.reset();
});
