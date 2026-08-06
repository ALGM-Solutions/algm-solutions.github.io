/* ======================================================
   ALGM Solutions — Main JavaScript
   Features: Mobile Nav, Filter, Lightbox, Scroll Reveal,
             Sticky Header, Scroll-to-Top, Active Nav Link
   ====================================================== */

(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on = (el, ev, fn, opts = false) => el && el.addEventListener(ev, fn, opts);

  const body = document.body;

  /* ==========================================================
     1. STICKY NAVIGATION (add shadow on scroll)
     ========================================================== */
  function initStickyNav() {
    const nav = $('#site-header');
    if (!nav) return;
    const handleScroll = () => {
      if (window.scrollY > 8) {
        nav.classList.add('backdrop-blur-sm', 'shadow-md');
        nav.style.backgroundColor = 'rgba(255,255,255,0.94)';
      } else {
        nav.classList.remove('backdrop-blur-sm', 'shadow-md');
        nav.style.backgroundColor = '';
      }
    };
    on(window, 'scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ==========================================================
     2. MOBILE NAV DRAWER
     ========================================================== */
  function initMobileNav() {
    const openBtn  = $('#nav-open');
    const closeBtn = $('#nav-close');
    const drawer   = $('#mobile-drawer');
    const backdrop = $('#drawer-backdrop');

    if (!drawer) return;

    const closeAll = () => {
      drawer.classList.remove('is-open');
      backdrop && backdrop.classList.remove('is-open');
      body.style.overflow = '';
    };
    const openAll = () => {
      drawer.classList.add('is-open');
      backdrop && backdrop.classList.add('is-open');
      body.style.overflow = 'hidden';
    };

    on(openBtn,  'click', openAll);
    on(closeBtn, 'click', closeAll);
    on(backdrop, 'click', closeAll);

    // Close when tapping a link in drawer
    $$('#mobile-drawer a').forEach(a => on(a, 'click', closeAll));

    // ESC to close
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        closeAll();
        closeLightbox();
      }
    });
  }

  /* ==========================================================
     3. ACTIVE NAV LINK (based on current page filename)
     ========================================================== */
  function initActiveNav() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';

    $$('.nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === file || (file === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });

    $$('.drawer-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === file || (file === '' && href === 'index.html')) {
        link.classList.add('text-[#003366]', 'font-bold', 'bg-[#f5f7fa]');
      }
    });
  }

  /* ==========================================================
     4. SCROLL REVEAL (staggered fade-up with IntersectionObserver)
     ========================================================== */
  function initScrollReveal() {
    const items = $$('.stagger-item, .reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(i => i.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay, 10) || (idx % 8) * 80;
          el.style.animationDelay = `${delay}ms`;
          el.classList.add('in-view');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

    items.forEach(i => io.observe(i));
  }

  /* ==========================================================
     5. FILTER (Projects & Gallery)
     ========================================================== */
  function initFilters() {
    const groups = $$('[data-filter-group]');
    groups.forEach(group => {
      const buttons = $$('[data-filter]', group);
      const items   = $$('[data-category]', group);

      buttons.forEach(btn => {
        on(btn, 'click', () => {
          const filter = btn.dataset.filter;

          // Toggle active class
          buttons.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');

          // Show/hide items
          items.forEach(item => {
            const cats = (item.dataset.category || '').split(/\s+/);
            const match = (filter === 'all') || cats.includes(filter);
            if (match) {
              item.style.display = '';
              item.classList.add('fade-up');
            } else {
              item.style.display = 'none';
              item.classList.remove('fade-up');
            }
          });
        });
      });
    });
  }

  /* ==========================================================
     6. LIGHTBOX (for Gallery)
     ========================================================== */
  let lightbox, lbImg, lbCap, lbPh;

  function buildLightbox() {
    if ($('#algm-lightbox')) return;

    lightbox = document.createElement('div');
    lightbox.id = 'algm-lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Tutup">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="lightbox-inner flex flex-col items-center gap-3 max-w-[1100px] w-full">
        <img src="" alt="" class="lb-img hidden" />
        <div class="lb-placeholder img-placeholder hidden"></div>
        <p class="lb-caption text-white/80 text-sm font-mono mt-1 max-w-[92vw]"></p>
      </div>
    `;
    body.appendChild(lightbox);
    lbImg = $('.lb-img', lightbox);
    lbPh  = $('.lb-placeholder', lightbox);
    lbCap = $('.lb-caption', lightbox);
    on(lightbox, 'click', (e) => { if (e.target === lightbox) closeLightbox(); });
    on($('.lightbox-close', lightbox), 'click', closeLightbox);
  }

  function openLightbox(src, caption, isPlaceholder = false) {
    buildLightbox();

    if (isPlaceholder) {
      lbImg.classList.add('hidden');
      lbPh.classList.remove('hidden');
      if (caption) lbPh.setAttribute('data-meta', caption);
    } else {
      lbPh.classList.add('hidden');
      lbImg.classList.remove('hidden');
      lbImg.src = src;
      lbImg.alt = caption || '';
    }
    lbCap.textContent = caption || '';
    requestAnimationFrame(() => {
      lightbox.classList.add('is-open');
      body.style.overflow = 'hidden';
    });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    body.style.overflow = '';
  }

  function initLightbox() {
    // Delegated click on gallery items
    on(document, 'click', (e) => {
      const trigger = e.target.closest('[data-lightbox]');
      if (!trigger) return;
      e.preventDefault();
      const src    = trigger.getAttribute('src') || trigger.dataset.src || '';
      const cap    = trigger.dataset.caption || trigger.getAttribute('alt') || '';
      const isPh   = trigger.classList.contains('img-placeholder') || trigger.dataset.placeholder === 'true';
      openLightbox(src, cap, isPh);
    });
  }

  /* ==========================================================
     7. SCROLL-TO-TOP BUTTON
     ========================================================== */
  function initScrollTop() {
    const btn = $('#scroll-top');
    if (!btn) return;
    const check = () => {
      if (window.scrollY > 380) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
    };
    on(window, 'scroll', check, { passive: true });
    on(btn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    check();
  }

  /* ==========================================================
     8. CONTACT FORM (client-side validation + fake submit)
     ========================================================== */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    const status = $('#form-status');

    on(form, 'submit', (e) => {
      e.preventDefault();

      // Basic validation
      const required = $$('[required]', form);
      let valid = true;
      required.forEach(f => {
        if (!f.value.trim()) {
          f.style.borderColor = '#d23a3a';
          valid = false;
        } else {
          f.style.borderColor = '';
        }
      });
      if (!valid) {
        if (status) {
          status.className = 'mt-3 text-sm font-medium text-red-600';
          status.textContent = 'Harap lengkapi semua kolom wajib.';
        }
        return;
      }

      // Simulate submission (site statis — integrate ke Formspree/Getform nanti)
      if (status) {
        status.className = 'mt-3 text-sm font-medium text-[#008000]';
        status.textContent = 'Mengirim pesan...';
      }
      setTimeout(() => {
        form.reset();
        if (status) status.textContent = 'Terima kasih! Pesan Anda akan segera kami tindaklanjuti.';
      }, 900);
    });
  }

  /* ==========================================================
     9. YEAR AUTO-UPDATE
     ========================================================== */
  function initYear() {
    const el = $('#current-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ==========================================================
     INIT ALL
     ========================================================== */
  function init() {
    initStickyNav();
    initMobileNav();
    initActiveNav();
    initScrollReveal();
    initFilters();
    initLightbox();
    initScrollTop();
    initContactForm();
    initYear();
  }

  if (document.readyState === 'loading') {
    on(document, 'DOMContentLoaded', init);
  } else {
    init();
  }

})();
