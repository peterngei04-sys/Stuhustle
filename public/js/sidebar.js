const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

if (menuBtn && sidebar && overlay) {

  menuBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
    document.body.classList.add("menu-open"); // lock page scroll
  });

  overlay.addEventListener("click", closeMenu);

  function closeMenu() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    document.body.classList.remove("menu-open");
  }

}
