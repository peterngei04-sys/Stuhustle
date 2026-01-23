// Make sure this is the ONLY place where 'auth' or 'db' are declared
document.addEventListener('DOMContentLoaded', () => {

  // HAMBURGER MENU
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  // FIREBASE
  const auth = firebase.auth();
  const db = firebase.firestore();

  const referralCodeEl = document.getElementById('referralCode');
  const referralsList = document.getElementById('referralsList');
  const copyBtn = document.getElementById('copyBtn');

  auth.onAuthStateChanged(user => {
    if (!user) return window.location.href = 'auth.html';
    const userId = user.uid;

    // Load referral code
    db.collection('users').doc(userId).get()
      .then(doc => {
        referralCodeEl.textContent = doc.exists ? (doc.data().referralCode || 'No code yet') : 'No code yet';
      });

    // Load referred users
    db.collection('users')
      .where('referredBy', '==', userId)
      .get()
      .then(snapshot => {
        referralsList.innerHTML = '';
        if (!snapshot.empty) {
          snapshot.forEach(doc => {
            const li = document.createElement('li');
            li.textContent = doc.data().name || 'Unknown User';
            referralsList.appendChild(li);
          });
        } else {
          referralsList.innerHTML = '<li>No referrals yet.</li>';
        }
      });

    // Copy referral code
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(referralCodeEl.textContent)
        .then(() => alert('Referral code copied!'))
        .catch(err => console.error(err));
    });
  });
});
