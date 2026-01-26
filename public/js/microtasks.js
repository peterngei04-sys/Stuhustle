// ===== HAMBURGER MENU =====
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
});

// ===== AUTH CHECK =====
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  }
});

// ===== TEMPORARY TASK DATA (Firestore later) =====
const demoTasks = [
  {
    title: "Follow Instagram Page",
    description: "Follow @stuhustle on Instagram and submit screenshot",
    reward: 20,
    proof: "Screenshot"
  },
  {
    title: "Write Short Review",
    description: "Write a 50-word review for a mobile app",
    reward: 50,
    proof: "Text"
  }
];

// ===== RENDER TASKS =====
const container = document.getElementById("tasksContainer");

function renderTasks() {
  container.innerHTML = "";

  demoTasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task-card";

    div.innerHTML = `
      <h4>${task.title}</h4>
      <p>${task.description}</p>
      <p class="reward">KES ${task.reward}</p>
      <button class="btn-outline">Start Task</button>
    `;

    container.appendChild(div);
  });
}

renderTasks();

// ===== CREATE TASK (UI ONLY FOR NOW) =====
document.getElementById("createTaskBtn").addEventListener("click", () => {
  alert("Task creation will be activated when Firestore is enabled.");
});
