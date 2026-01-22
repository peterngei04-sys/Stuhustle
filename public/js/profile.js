const auth = firebase.auth();

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileUID = document.getElementById("profileUID");
const profileProvider = document.getElementById("profileProvider");

const profileAvatar = document.getElementById("profileAvatar");
const topAvatar = document.getElementById("topAvatar");

const displayNameInput = document.getElementById("displayNameInput");
const photoURLInput = document.getElementById("photoURLInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const profileMsg = document.getElementById("profileMsg");

/* Auth Listener */
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  profileName.textContent = user.displayName || "No name set";
  profileEmail.textContent = user.email;
  profileUID.textContent = user.uid;
  profileProvider.textContent = user.providerData[0]?.providerId || "password";

  profileAvatar.src = user.photoURL || "https://i.pravatar.cc/120";
  topAvatar.src = user.photoURL || "https://i.pravatar.cc/40";

  displayNameInput.value = user.displayName || "";
  photoURLInput.value = user.photoURL || "";
});

/* Update Profile */
saveProfileBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await user.updateProfile({
      displayName: displayNameInput.value.trim(),
      photoURL: photoURLInput.value.trim()
    });

    profileMsg.style.color = "var(--secondary)";
    profileMsg.textContent = "Profile updated successfully";

    profileName.textContent = user.displayName;
    profileAvatar.src = user.photoURL;
    topAvatar.src = user.photoURL;

  } catch (error) {
    profileMsg.style.color = "#ef4444";
    profileMsg.textContent = error.message;
  }
});
