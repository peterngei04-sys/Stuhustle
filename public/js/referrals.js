// Hamburger Menu
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

// Firebase references
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const referralLinkInput = document.getElementById('referralLink');
const copyBtn = document.getElementById('copyBtn');
const referralList = document.getElementById('referralList');
const totalPointsElem = document.getElementById('totalPoints');

// Current user
let currentUser;

// Auth state
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    currentUser = user;
    setupReferral();
    loadReferrals();
  }
});

// Setup referral link
function setupReferral() {
  const baseUrl = window.location.origin + '/signup.html';
  referralLinkInput.value = `${baseUrl}?ref=${currentUser.uid}`;
}

// Copy referral link
copyBtn.addEventListener('click', () => {
  referralLinkInput.select();
  referralLinkInput.setSelectionRange(0, 99999);
  document.execCommand('copy');
  alert('Referral link copied!');
});

// Load referrals
function loadReferrals() {
  db.collection('referrals')
    .where('referrerId', '==', currentUser.uid)
    .get()
    .then(snapshot => {
      let totalPoints = 0;
      referralList.innerHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement('li');
        li.textContent = `${data.referredEmail} - Earned ${data.points} pts`;
        referralList.appendChild(li);
        totalPoints += data.points;
      });
      totalPointsElem.textContent = totalPoints;
    })
    .catch(err => console.error('Error loading referrals:', err));
}
