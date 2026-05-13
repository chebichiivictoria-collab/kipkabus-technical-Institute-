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

  // Smooth scrolling for same-page anchors (respects reduced-motion)
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $all('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = $(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({behavior: prefersReducedMotion ? 'auto' : 'smooth', block:'start'});
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


  // Modal + Accordion + minor pro UX
  const MODAL = {
    root: null,
    closeBtn: null,
    lastActive: null,
    open(modalEl){
      if (!modalEl) return;
      const modal = modalEl.closest('[data-modal]') || modalEl;
      const root = modal;
      if (!root) return;
      this.root = root;
      this.lastActive = document.activeElement;

      root.classList.add('open');
      root.setAttribute('aria-hidden', 'false');
      this.closeBtn = root.querySelector('[data-modal-close]') || root.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

      // Focus close button
      (this.closeBtn || root).focus?.();

      // Focus trap
      root.addEventListener('keydown', this._trapHandler);

      // Prevent body scroll
      document.documentElement.style.overflow = 'hidden';
    },
    close(){
      if (!this.root) return;
      this.root.classList.remove('open');
      this.root.setAttribute('aria-hidden', 'true');
      this.root.removeEventListener('keydown', this._trapHandler);

      document.documentElement.style.overflow = '';
      if (this.lastActive && this.lastActive.focus) this.lastActive.focus();

      this.root = null;
      this.closeBtn = null;
      this.lastActive = null;
    },
    _trapHandler(e){
      if (!MODAL.root) return;
      if (e.key !== 'Tab') return;
      const focusables = Array.from(
        MODAL.root.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);

      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first){
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last){
        e.preventDefault();
        first.focus();
      }
    }
  };

  // Wire modal triggers
  $all('[data-modal-target]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const sel = trigger.getAttribute('data-modal-target');
      if (!sel) return;
      const modalEl = document.querySelector(sel);
      if (!modalEl) return;
      e.preventDefault();
      MODAL.open(modalEl);
    });
  });

  // Close buttons + backdrop
  $all('[data-modal]').forEach(modalRoot => {
    modalRoot.setAttribute('aria-hidden', 'true');
    const closeBtn = modalRoot.querySelector('[data-modal-close]');
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); MODAL.close(); });

    modalRoot.addEventListener('click', (e) => {
      if (e.target === modalRoot) MODAL.close();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (MODAL.root) MODAL.close();
  });

  // Accordions
  $all('[data-accordion]').forEach(acc => {
    acc.querySelectorAll('[data-accordion-item]').forEach(item => {
      const btn = item.querySelector('[data-accordion-button]');
      const panel = item.querySelector('[data-accordion-panel]');
      if (!btn || !panel) return;

      // Init
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      panel.hidden = !expanded;

      btn.addEventListener('click', () => {
        const allowMultiple = acc.getAttribute('data-allow-multiple') === 'true';

        if (!allowMultiple){
          acc.querySelectorAll('[data-accordion-item]').forEach(other => {
            if (other === item) return;
            const otherBtn = other.querySelector('[data-accordion-button]');
            const otherPanel = other.querySelector('[data-accordion-panel]');
            if (otherBtn && otherPanel){
              otherBtn.setAttribute('aria-expanded','false');
              otherPanel.hidden = true;
            }
          });
        }

        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isExpanded));
        panel.hidden = isExpanded;
      });
    });
  });

})();




