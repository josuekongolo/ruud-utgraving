/* ===================================
   RUUD UTGRAVING OG SNØDRIFT AS
   Main JavaScript
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initCounters();
  initBackToTop();
  initGalleryFilters();
  initContactForm();
});

/* --- NAVIGATION --- */
function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');

  // Scroll behavior
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 60);
    lastScroll = y;
  }, { passive: true });

  // Mobile menu
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isActive = toggle.classList.contains('is-active');
      toggle.classList.toggle('is-active');
      links.classList.toggle('is-active');
      if (overlay) overlay.classList.toggle('is-active');
      document.body.style.overflow = isActive ? '' : 'hidden';
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        toggle.classList.remove('is-active');
        links.classList.remove('is-active');
        overlay.classList.remove('is-active');
        document.body.style.overflow = '';
      });
    }

    // Close on link click
    links.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('is-active');
        links.classList.remove('is-active');
        if (overlay) overlay.classList.remove('is-active');
        document.body.style.overflow = '';
      });
    });
  }

  // Set active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });
}

/* --- SCROLL REVEAL --- */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!elements.length) return;

  // Set stagger indices
  document.querySelectorAll('.stagger').forEach(parent => {
    [...parent.children].forEach((child, i) => {
      child.style.setProperty('--i', i);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* --- COUNTER ANIMATION --- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(eased * target);
    el.textContent = prefix + current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

/* --- BACK TO TOP --- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --- GALLERY FILTERS --- */
function initGalleryFilters() {
  const filters = document.querySelectorAll('.gallery-filter');
  const cards = document.querySelectorAll('.project-card');
  if (!filters.length || !cards.length) return;

  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.filter;

      // Update active filter
      filters.forEach(f => f.classList.remove('is-active'));
      filter.classList.add('is-active');

      // Filter cards
      cards.forEach(card => {
        const cardCat = card.dataset.category;
        const show = category === 'alle' || cardCat === category;
        card.style.opacity = show ? '' : '0';
        card.style.transform = show ? '' : 'scale(0.95)';
        setTimeout(() => {
          card.style.display = show ? '' : 'none';
        }, show ? 0 : 300);
      });
    });
  });
}

/* --- CONTACT FORM --- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('formStatus');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#E8710A';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    if (!valid) {
      showStatus(status, 'Vennligst fyll ut alle påkrevde felt.', 'error');
      return;
    }

    // Validate email
    const email = form.querySelector('[name="email"]');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#E8710A';
      showStatus(status, 'Vennligst oppgi en gyldig e-postadresse.', 'error');
      return;
    }

    submitBtn.textContent = 'Sender...';
    submitBtn.disabled = true;

    // Collect form data
    const data = Object.fromEntries(new FormData(form));
    data.befaring = form.querySelector('[name="befaring"]')?.checked ? 'Ja' : 'Nei';

    try {
      // Send via Resend API endpoint
      // NOTE: Replace '/api/contact' with your actual backend endpoint
      // The backend should use Resend to forward the email to ruudgravingogsnodrift@gmail.com
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showStatus(status, 'Takk for din henvendelse! Vi tar kontakt innen 24 timer.', 'success');
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      // Fallback: open mailto
      const subject = encodeURIComponent(`Henvendelse fra ${data.navn} - ${data.tjeneste || 'Generell'}`);
      const body = encodeURIComponent(
        `Navn: ${data.navn}\nE-post: ${data.email}\nTelefon: ${data.telefon}\nAdresse: ${data.adresse || 'Ikke oppgitt'}\nTjeneste: ${data.tjeneste || 'Ikke valgt'}\nØnsker befaring: ${data.befaring}\n\nBeskrivelse:\n${data.beskrivelse || 'Ingen beskrivelse'}`
      );
      window.location.href = `mailto:ruudgravingogsnodrift@gmail.com?subject=${subject}&body=${body}`;
      showStatus(status, 'E-postklienten din ble åpnet. Send meldingen derfra, eller ring oss direkte på 412 13 218.', 'success');
    }

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}

function showStatus(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = `form-status form-status--${type}`;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* --- PARALLAX for watermark (subtle) --- */
window.addEventListener('scroll', () => {
  const watermark = document.querySelector('.hero__watermark');
  if (watermark) {
    const y = window.scrollY;
    watermark.style.transform = `translate(-50%, calc(-55% + ${y * 0.15}px))`;
  }
}, { passive: true });
