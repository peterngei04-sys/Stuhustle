ocument.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const referralCodeEl = document.getElementById('referralCode');
  const referralsList = document.getElementById('referralsList');
  const copyBtn = document.getElementById('copyBtn');

  // Hamburger toggle
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  // Firebase references
  const auth = firebase.auth();
  const db = firebase.firestore();

  auth.onAuthStateChanged(user => {
    if (user) {
      const userId = user.uid;

      // Load referral code
      db.collection('users').doc(userId).get()
        .then(doc => {
          if (doc.exists) {
            referralCodeEl.textContent = doc.data().referralCode || 'No code yet';
          }
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
        })
        .catch(err => {
          console.error('Error loading referrals:', err);
          referralsList.innerHTML = '<li>Error loading referrals.</li>';
        });

      // Copy code functionality
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(referralCodeEl.textContent)
          .then(() => alert('Referral code copied!'))
          .catch(err => console.error('Failed to copy:', err));
      });
    } else {
      // User not logged in
      window.location.href = 'auth.html';
    }
  });
});
