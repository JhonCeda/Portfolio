const menuToggle = document.getElementById('mobile-menu-toggle');
const mainNav = document.getElementById('main-nav');

// create overlay element dynamically
let overlay = document.createElement('div');
overlay.classList.add('overlay');
document.body.appendChild(overlay);

menuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('active');
  overlay.classList.toggle('active');
});

// close menu when clicking overlay
overlay.addEventListener('click', () => {
  mainNav.classList.remove('active');
  overlay.classList.remove('active');
});
