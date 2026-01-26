firebase.auth().onAuthStateChanged(user => {
  if (!user) window.location.href = "login.html";
});

document.getElementById("postBtn").onclick = () => {
  alert("Listing posted! (Firestore activation coming next)");
};
