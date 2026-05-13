(() => {
  function $(sel, root = document){
    return root.querySelector(sel);
  }

  function $all(sel, root = document){
    return Array.from(root.querySelectorAll(sel));
  }

  // Mobile navbar toggle
  const burger = $('.burger');
  const navLinks = $('.nav-links');
  if (burger && navLinks){
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    // Close menu when clicking a nav link
    $all('.nav-links a', document).forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // Active link highlighting (best-effort)
  const path = (location.pathname || '').toLowerCase();
  const anchors = $all('.nav-links a');
  anchors.forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (!href) return;
    if (href === 'index.html' && (path.endsWith('/') || path.endsWith('index.html'))) {
      a.classList.add('active');
      return;
    }
    if (path.endsWith(href)) a.classList.add('active');
  });

  // Smooth scrolling for same-page anchors
  $all('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // Contact form validation (frontend-only)
  const form = $('#contactForm');
  const toast = $('#formToast');
  if (form && toast){
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const getVal = (name) => (form.elements[name]?.value || '').trim();
      const required = ['fullName','email','phone','message'];
      const missing = required.filter(n => !getVal(n));

      const emailVal = getVal('email');
      const emailOk = emailVal === '' ? false : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

      if (missing.length){
        showToast('Please fill in all required fields.');
        return;
      }

      if (!emailOk){
        showToast('Please enter a valid email address.');
        return;
      }

      showToast('Message sent successfully. We will get back to you soon.');
      form.reset();
    });
  }

  function showToast(msg){
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => toast.classList.remove('show'), 5000);
  }
})();

