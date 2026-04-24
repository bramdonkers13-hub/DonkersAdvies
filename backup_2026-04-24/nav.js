// Mobile hamburger
const toggle = document.getElementById('navToggle');
const links  = document.getElementById('navLinks');
if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a:not(.dropdown-trigger)').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
}

// Mobile dropdown toggle (tap on "Diensten")
document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
  trigger.addEventListener('click', e => {
    if (window.innerWidth <= 720) {
      e.preventDefault();
      trigger.closest('.has-dropdown').classList.toggle('open');
    }
  });
});

// Scroll fade-in (shared)
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('[data-fade]').forEach(el => observer.observe(el));

// Werkwijze: animate connecting line when section enters view
const stepsEl = document.querySelector('.steps');
if (stepsEl) {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('steps-visible'); }
    });
  }, { threshold: 0.3 }).observe(stepsEl);
}
