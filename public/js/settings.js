// DARK MODE
const darkToggle = document.getElementById("darkModeToggle");
if(darkToggle){
  const darkMode = localStorage.getItem("darkMode") === "true";
  darkToggle.checked = darkMode;
  document.body.classList.toggle("dark-mode", darkMode);

  darkToggle.addEventListener("change", ()=>{
    document.body.classList.toggle("dark-mode", darkToggle.checked);
    localStorage.setItem("darkMode", darkToggle.checked);
  });
}

// LOGOUT
const logoutBtn = document.getElementById("logoutBtn");
if(logoutBtn){
  logoutBtn.onclick = () => {
    if(confirm("Are you sure you want to log out?")){
      firebase.auth().signOut().then(()=> location.href="login.html");
    }
  };
}

// DELETE ACCOUNT
const deleteBtn = document.getElementById("deleteBtn");
if(deleteBtn){
  deleteBtn.onclick = () => {
    if(confirm("This action is permanent. Delete account?")){
      const user = firebase.auth().currentUser;
      if(user){
        user.delete().then(()=> alert("Account deleted")).catch(()=> alert("Re-login required to delete account."));
      }
    }
  };
}

// PASSWORD CHANGE
const changePasswordBtn = document.getElementById("changePasswordBtn");
if(changePasswordBtn){
  changePasswordBtn.onclick = () => {
    const newPass = document.getElementById("newPassword").value;
    const confirmPass = document.getElementById("confirmPassword").value;
    const user = firebase.auth().currentUser;

    if(!newPass || !confirmPass) return alert("Enter both fields.");
    if(newPass !== confirmPass) return alert("Passwords do not match.");
    if(user){
      user.updatePassword(newPass)
        .then(()=> alert("Password updated successfully."))
        .catch(err => alert(err.message));
    }
  };
}

// ACTIVE SESSIONS
const sessionsList = document.getElementById("sessionsList");
if(sessionsList){
  const user = firebase.auth().currentUser;
  if(user && db){
    db.collection("sessions").where("uid","==",user.uid).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const li = document.createElement("li");
          li.textContent = `${doc.data().device} - ${doc.data().lastLogin}`;
          sessionsList.appendChild(li);
        });
      });
  }
}

// WITHDRAWAL PREFS
const saveWithdrawalPrefs = document.getElementById("saveWithdrawalPrefs");
if(saveWithdrawalPrefs){
  saveWithdrawalPrefs.onclick = () => {
    const method = document.getElementById("defaultMethod").value;
    const threshold = document.getElementById("minThreshold").value;
    const user = firebase.auth().currentUser;
    if(user && db){
      db.collection("users").doc(user.uid).set({
        withdrawalMethod: method,
        minWithdrawal: threshold
      }, {merge:true}).then(()=> alert("Withdrawal preferences saved"));
    }
  };
}

// NOTIFICATIONS
const saveNotifications = document.getElementById("saveNotifications");
if(saveNotifications){
  saveNotifications.onclick = () => {
    const rewards = document.getElementById("rewardsToggle").checked;
    const payouts = document.getElementById("payoutsToggle").checked;
    const user = firebase.auth().currentUser;
    if(user && db){
      db.collection("users").doc(user.uid).set({
        notifyRewards: rewards,
        notifyPayouts: payouts
      }, {merge:true}).then(()=> alert("Notifications saved"));
    }
  };
}
