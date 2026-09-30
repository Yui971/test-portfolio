/* ==============================================================
   PORTFOLIO CHRISNAEL BERDIER - JavaScript Principal V6
   ============================================================== */

/* === MODULE 1 : THEME === */
const ThemeManager = (() => {
  const html = document.documentElement;
  const STORAGE_KEY = 'portfolio-theme';
  function getAutoTheme() { return 'dark'; }
  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    const btn = document.querySelector('.theme-switch');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Passer en mode jour' : 'Passer en mode nuit');
  }
  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    setTheme(saved || getAutoTheme());
    const btn = document.querySelector('.theme-switch');
    if (btn) btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next); localStorage.setItem(STORAGE_KEY, next);
    });
  }
  return { init };
})();

/* === MODULE 2 : NAVIGATION === */
const Navigation = (() => {
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav__burger');
  const drawer = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('drawer-backdrop');
  let lastScroll = 0;
  function init() {
    if (!nav) return;
    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      if (current > 100 && current > lastScroll) nav.classList.add('is-hidden');
      else nav.classList.remove('is-hidden');
      lastScroll = current;
    }, { passive: true });
    if (burger && drawer) {
      function closeMenu() {
        drawer.classList.remove('is-open');
        if (backdrop) backdrop.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.style.overflow = '';
      }
      burger.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('is-open');
        if (backdrop) backdrop.classList.toggle('is-open', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
        burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      const closeBtn = document.getElementById('nav-mobile-close');
      if (closeBtn) closeBtn.addEventListener('click', closeMenu);
      if (backdrop) backdrop.addEventListener('click', closeMenu);
      drawer.querySelectorAll('.nav__drawer-link').forEach(link => {
        link.addEventListener('click', closeMenu);
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeMenu();
      });
    }
  }
  return { init };
})();

/* === MODULE 3 : PARTICULES === */
const ParticleSystem = (() => {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return { init: () => {} };
  const ctx = canvas.getContext('2d');
  let particles = []; let mouse = { x: null, y: null }; let animId;
  const COUNT_MOBILE = 40; const COUNT_DESKTOP = 80;
  const CONNECT_DIST = 140; const MOUSE_RADIUS = 180;

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.5 + 1;
      this.speedX = (Math.random() - 0.5) * 0.6; this.speedY = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.speedX; this.y += this.speedY;
      if (mouse.x !== null) {
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          this.x += dx * force * 0.015; this.y += dy * force * 0.015;
          this.opacity = Math.min(0.8, this.opacity + 0.02);
        } else { this.opacity = Math.max(0.1, this.opacity - 0.005); }
      }
      if (this.x < 0) this.x = canvas.width; if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height; if (this.y > canvas.height) this.y = 0;
    }
    draw() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const c = isDark ? '255,255,255' : '26,26,46';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c}, ${this.opacity})`; ctx.fill();
    }
  }

  const isFullPage = canvas.classList.contains('page-particles');
  function resize() {
    if (isFullPage) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    else { const hero = canvas.parentElement; canvas.width = hero.clientWidth; canvas.height = hero.clientHeight; }
    const count = window.innerWidth < 768 ? COUNT_MOBILE : COUNT_DESKTOP;
    particles = Array.from({ length: count }, () => new Particle());
  }
  function drawLines() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const c = isDark ? '255,255,255' : '26,26,46';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${c}, ${(1 - dist / CONNECT_DIST) * 0.15})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); }); drawLines();
    animId = requestAnimationFrame(animate);
  }
  function init() {
    resize(); animate();
    window.addEventListener('resize', () => { cancelAnimationFrame(animId); resize(); animate(); });
    const mouseTarget = isFullPage ? document : canvas;
    mouseTarget.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    mouseTarget.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    mouseTarget.addEventListener('touchmove', (e) => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }, { passive: true });
    mouseTarget.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });
  }
  return { init };
})();

/* === MODULE 4 : SCROLL REVEAL === */
const ScrollReveal = (() => {
  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  return { init };
})();

/* === MODULE 5 : FILTERS + SEARCH === */
const ProjectFilters = (() => {
  function init() {
    const toolbar    = document.querySelector('.projects__toolbar');
    const catBtns    = document.querySelectorAll('#filters-cat .filter-btn');
    const ueBtns     = document.querySelectorAll('#filters-ue .filter-btn');
    const cards      = document.querySelectorAll('.project-card');
    const searchInput = document.getElementById('project-search');
    const emptyMsg   = document.getElementById('projects-empty');
    const modeToggle = document.getElementById('filter-mode-toggle');
    const labelCat   = document.getElementById('label-cat');
    const labelUe    = document.getElementById('label-ue');
    if (!cards.length) return;

    let mode = 'cat', catFilter = 'all', ueFilter = 'all', search = '';

    function applyFilters() {
      let n = 0;
      cards.forEach(card => {
        const matchFilter = mode === 'cat'
          ? (catFilter === 'all' || card.dataset.category === catFilter)
          : (ueFilter  === 'all' || card.dataset.ue       === ueFilter);
        const title = (card.dataset.projectTitle || '').toLowerCase();
        const desc  = (card.dataset.projectDesc  || '').toLowerCase();
        const tags  = (card.dataset.projectTags  || '').toLowerCase();
        const matchSearch = !search || title.includes(search) || desc.includes(search) || tags.includes(search);
        if (matchFilter && matchSearch) {
          card.classList.remove('is-hidden');
          card.style.animation = 'fadeInUp 0.5s var(--ease-out) forwards';
          n++;
        } else { card.classList.add('is-hidden'); }
      });
      if (emptyMsg) emptyMsg.classList.toggle('is-visible', n === 0);
    }

    catBtns.forEach(btn => btn.addEventListener('click', () => {
      catFilter = btn.dataset.filter;
      catBtns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('is-active'); btn.setAttribute('aria-pressed', 'true');
      applyFilters();
    }));

    ueBtns.forEach(btn => btn.addEventListener('click', () => {
      ueFilter = btn.dataset.ueFilter;
      ueBtns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('is-active'); btn.setAttribute('aria-pressed', 'true');
      applyFilters();
    }));

    if (modeToggle) {
      function switchMode() {
        mode = mode === 'cat' ? 'ue' : 'cat';
        const isUe = mode === 'ue';
        modeToggle.setAttribute('aria-checked', isUe ? 'true' : 'false');
        if (toolbar) toolbar.classList.toggle('projects__toolbar--ue', isUe);
        if (labelCat) labelCat.classList.toggle('is-active', !isUe);
        if (labelUe)  labelUe.classList.toggle('is-active', isUe);
        applyFilters();
      }
      if (labelCat) labelCat.classList.add('is-active');
      modeToggle.addEventListener('click', switchMode);
      modeToggle.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); switchMode(); } });
    }

    if (searchInput) searchInput.addEventListener('input', e => { search = e.target.value.toLowerCase().trim(); applyFilters(); });
  }
  return { init };
})();

/* === MODULE 7 : COUNT UP === */
const CountUp = (() => {
  function animateCount(el, target) {
    const suffix = el.dataset.suffix || '+';
    let current = 0; const step = target / (1500 / 16);
    function update() {
      current += step;
      if (current >= target) { el.textContent = target + suffix; return; }
      el.textContent = Math.floor(current) + suffix;
      requestAnimationFrame(update);
    }
    update();
  }
  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('[data-count]').forEach(el => animateCount(el, parseInt(el.dataset.count)));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.about__stats').forEach(s => observer.observe(s));
  }
  return { init };
})();

/* === MODULE 8 : CONTACT FORM === */
const ContactForm = (() => {
  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const status = document.getElementById('form-status');
    if (window.location.search.includes('sent=true')) {
      if (status) { status.textContent = '\u2713 Message envoy\u00e9 avec succ\u00e8s ! Je vous r\u00e9pondrai rapidement.'; status.className = 'form-status is-success'; }
      window.history.replaceState({}, '', window.location.pathname);
    }
    form.addEventListener('submit', (e) => {
      const name = form.querySelector('#form-name'), email = form.querySelector('#form-email'), message = form.querySelector('#form-message');
      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) { e.preventDefault(); status.textContent = 'Veuillez remplir tous les champs obligatoires.'; status.className = 'form-status is-error'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { e.preventDefault(); status.textContent = 'Veuillez entrer une adresse email valide.'; status.className = 'form-status is-error'; }
    });
  }
  return { init };
})();

/* === MODULE 9 : PROJECT MODAL (images + video + iframe + drag/pan) === */
const ProjectModal = (() => {
  let zoom = 1, panX = 0, panY = 0;
  let openRef = null;      // openModal, exposée via ProjectModal.open(el)
  let lastTrigger = null;  // élément à re-focaliser à la fermeture (RGAA)
  let dragging = false, dsx = 0, dsy = 0, spx = 0, spy = 0;
  const STEP = 0.25, MIN = 0.5, MAX = 3;

  function init() {
    const overlay = document.getElementById('project-modal');
    if (!overlay) return;

    const closeBtn = overlay.querySelector('.project-modal__close-btn');
    const container = document.getElementById('modal-media-container');
    const img = document.getElementById('project-modal-img');
    const controls = document.getElementById('modal-controls');
    const title = document.getElementById('project-modal-title');
    const desc = document.getElementById('project-modal-desc');
    const tags = document.getElementById('project-modal-tags');
    const extLink = document.getElementById('project-modal-ext');
    const zoomIn = document.getElementById('modal-zoom-in');
    const zoomOut = document.getElementById('modal-zoom-out');
    const zoomReset = document.getElementById('modal-zoom-reset');
    const savePng = document.getElementById('modal-save-png');

    function applyTransform() {
      if (img) img.style.transform = 'scale(' + zoom + ') translate(' + panX + 'px,' + panY + 'px)';
      if (img) img.classList.toggle('is-draggable', zoom > 1);
    }
    function resetView() { zoom = 1; panX = 0; panY = 0; applyTransform(); }

    function clearMedia() {
      // Remove any video/site iframes
      container.querySelectorAll('.project-modal__video-wrap, .project-modal__site-wrap').forEach(el => el.remove());
      img.style.display = '';
      img.src = '';
      controls.style.display = '';
      if (extLink) { extLink.style.display = 'none'; extLink.href = '#'; }
    }

    function openModal(card) {
      lastTrigger = document.activeElement;
      clearMedia();
      resetView();

      const imgSrc = card.dataset.projectImg;
      const videoId = card.dataset.projectVideo;
      const siteUrl = card.dataset.projectUrl;
      const t = card.dataset.projectTitle;
      const d = card.dataset.projectDesc;
      const tgs = (card.dataset.projectTags || '').split(',').filter(Boolean);

      if (title) title.textContent = t;
      if (desc) desc.textContent = d;
      if (tags) tags.innerHTML = tgs.map(function(tg, i) { return '<span class="tag ' + (i > 0 ? 'tag--secondary' : '') + '">' + tg.trim() + '</span>'; }).join('');

      if (videoId) {
        // YouTube embed
        img.style.display = 'none';
        controls.style.display = 'none';
        var vw = document.createElement('div');
        vw.className = 'project-modal__video-wrap';
        vw.innerHTML = '<iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
        container.insertBefore(vw, controls);
      } else if (siteUrl) {
        // Website iframe (prioritaire sur la capture statique)
        img.style.display = 'none';
        controls.style.display = 'none';
        var sw = document.createElement('div');
        sw.className = 'project-modal__site-wrap';
        sw.innerHTML = '<iframe src="' + siteUrl + '" loading="lazy"></iframe>';
        container.insertBefore(sw, controls);
        if (extLink) { extLink.href = siteUrl; extLink.style.display = 'inline-flex'; }
      } else if (imgSrc) {
        // Image statique (projets graphiques)
        img.src = imgSrc;
        img.alt = t;
        controls.style.display = '';
      }

      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      clearMedia();
      resetView();
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
      lastTrigger = null;
    }
    openRef = openModal;

    // Zoom
    if (zoomIn) zoomIn.addEventListener('click', function(e) { e.stopPropagation(); if (zoom < MAX) { zoom += STEP; applyTransform(); } });
    if (zoomOut) zoomOut.addEventListener('click', function(e) { e.stopPropagation(); if (zoom > MIN) { zoom -= STEP; if (zoom <= 1) { panX = 0; panY = 0; } applyTransform(); } });
    if (zoomReset) zoomReset.addEventListener('click', function(e) { e.stopPropagation(); resetView(); });

    // Wheel zoom
    if (container) container.addEventListener('wheel', function(e) {
      if (!img || img.style.display === 'none') return;
      e.preventDefault();
      if (e.deltaY < 0 && zoom < MAX) zoom += STEP;
      else if (e.deltaY > 0 && zoom > MIN) zoom -= STEP;
      if (zoom <= 1) { panX = 0; panY = 0; }
      applyTransform();
    }, { passive: false });

    // Drag/pan
    if (img) {
      img.addEventListener('mousedown', function(e) {
        if (zoom <= 1) return;
        dragging = true; dsx = e.clientX; dsy = e.clientY; spx = panX; spy = panY;
        img.classList.add('is-dragging'); e.preventDefault();
      });
      document.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        panX = spx + (e.clientX - dsx) / zoom;
        panY = spy + (e.clientY - dsy) / zoom;
        applyTransform();
      });
      document.addEventListener('mouseup', function() { if (dragging) { dragging = false; if (img) img.classList.remove('is-dragging'); } });

      img.addEventListener('touchstart', function(e) {
        if (zoom <= 1 || e.touches.length !== 1) return;
        dragging = true; dsx = e.touches[0].clientX; dsy = e.touches[0].clientY; spx = panX; spy = panY;
        img.classList.add('is-dragging');
      }, { passive: true });
      document.addEventListener('touchmove', function(e) {
        if (!dragging) return;
        panX = spx + (e.touches[0].clientX - dsx) / zoom;
        panY = spy + (e.touches[0].clientY - dsy) / zoom;
        applyTransform();
      }, { passive: true });
      document.addEventListener('touchend', function() { if (dragging) { dragging = false; if (img) img.classList.remove('is-dragging'); } });
    }

    // Save PNG
    if (savePng) savePng.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!img || !img.src || img.style.display === 'none') return;
      var src = img.src.replace('.webp', '.png');
      var fn = (title.textContent || 'projet').replace(/[^a-zA-Z0-9\u00e0-\u00ff\s-]/gi, '').replace(/\s+/g, '-').toLowerCase() + '.png';
      fetch(src).then(function(r) { return r.ok ? r : fetch(img.src); }).then(function(r) { return r.blob(); }).then(function(blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = fn;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }).catch(function() { window.open(img.src, '_blank'); });
    });

    // Attach cards
    document.querySelectorAll('.project-card[data-project-title]').forEach(function(card) {
      var btn = card.querySelector('.project-card__link');
      if (btn) btn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); openModal(card); });
      card.addEventListener('click', function() { openModal(card); });
      card.addEventListener('keydown', function(e) { if (e.key === 'Enter') openModal(card); });
    });

    // Close
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal(); });
  }
  // Ouvre la modale depuis n'importe quel élément portant les data-project-* (ex. carte des compétences)
  function open(el) { if (openRef) openRef(el); }
  return { init, open };
})();

/* === MODULE 10 : CV VIEWER === */
const CVViewer = (() => {
  function init() {
    const openBtn = document.getElementById('open-cv-viewer');
    const overlay = document.getElementById('cv-modal');
    if (!openBtn || !overlay) return;

    const closeBtn = document.getElementById('cv-modal-close');
    const iframe = document.getElementById('cv-modal-iframe');

    function open() {
      iframe.src = 'assets/cv/CV_BERDIER_CHRISNAEL.pdf';
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      iframe.src = '';
    }
    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });
  }
  return { init };
})();

/* === MODULE 11 : LEGAL MODAL === */
const LegalModal = (() => {
  function init() {
    const overlay = document.getElementById('legal-modal');
    const openBtn = document.getElementById('open-legal');
    if (!overlay || !openBtn) return;
    const closeBtn = overlay.querySelector('.modal__close');
    function open() { overlay.classList.add('is-open'); closeBtn.focus(); document.body.style.overflow = 'hidden'; }
    function close() { overlay.classList.remove('is-open'); openBtn.focus(); document.body.style.overflow = ''; }
    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });
  }
  return { init };
})();

/* === MODULE 12 : A11Y WIDGET === */
const A11yWidget = (() => {
  let zoomLevel = 1;
  function init() {
    const toggle = document.getElementById('a11y-toggle');
    const panel = document.getElementById('a11y-panel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function() { var isOpen = panel.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', isOpen); });
    document.addEventListener('click', function(e) { if (!e.target.closest('.a11y-widget')) { panel.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); } });
    document.querySelectorAll('[data-zoom]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = btn.dataset.zoom;
        if (action === 'increase' && zoomLevel < 1.5) zoomLevel += 0.1;
        if (action === 'decrease' && zoomLevel > 0.85) zoomLevel -= 0.1;
        if (action === 'reset') zoomLevel = 1;
        document.documentElement.style.setProperty('--a11y-zoom', zoomLevel);
      });
    });
    var contrastBtn = document.getElementById('contrast-toggle');
    if (contrastBtn) contrastBtn.addEventListener('click', function() { var a = document.body.classList.toggle('high-contrast'); contrastBtn.setAttribute('aria-pressed', a); });
    var motionBtn = document.getElementById('motion-toggle');
    if (motionBtn) motionBtn.addEventListener('click', function() { var a = document.body.classList.toggle('reduce-motion'); motionBtn.setAttribute('aria-pressed', a); });
    var spacingBtn = document.getElementById('spacing-toggle');
    if (spacingBtn) spacingBtn.addEventListener('click', function() { var a = document.body.classList.toggle('wide-spacing'); spacingBtn.setAttribute('aria-pressed', a); });
  }
  return { init };
})();

/* === MODULE 13 : BACK TO TOP === */
const BackToTop = (() => {
  function init() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function() { btn.classList.toggle('is-visible', window.scrollY > 400); }, { passive: true });
    btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
  return { init };
})();

/* === INIT === */
document.addEventListener('DOMContentLoaded', function() {
  ThemeManager.init();
  Navigation.init();
  ParticleSystem.init();
  ScrollReveal.init();
  ProjectFilters.init();
  ProjectModal.init();
  CVViewer.init();
  CountUp.init();
  ContactForm.init();
  LegalModal.init();
  A11yWidget.init();
  BackToTop.init();
});

/* === MODULE V8 : LOADER === */
const Loader = (() => {
  function init() {
    const loader = document.getElementById('site-loader');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('is-done'), 600);
    });
  }
  return { init };
})();

/* === MODULE V8 : CUSTOM CURSOR === */
const CustomCursor = (() => {
  function init() {
    const cur = document.getElementById('custom-cursor');
    if (!cur || !window.matchMedia('(pointer: fine)').matches) return;
    document.addEventListener('mousemove', e => {
      cur.style.left = e.clientX + 'px';
      cur.style.top = e.clientY + 'px';
      if (!cur.classList.contains('is-visible')) cur.classList.add('is-visible');
    });
    document.querySelectorAll('a, button, .project-card, .nav__link, .filter-btn').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cur.classList.remove('is-hover'));
    });
  }
  return { init };
})();

/* === MODULE V8 : PAGE TRANSITIONS === */
const PageTransitions = (() => {
  function init() {
    const overlay = document.getElementById('page-transition');
    if (!overlay) return;
    // Intercept internal navigation links
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || link.hasAttribute('download') || link.getAttribute('target') === '_blank') return;
      link.addEventListener('click', e => {
        e.preventDefault();
        overlay.classList.add('is-entering');
        setTimeout(() => { window.location.href = href; }, 650);
      });
    });
    // On page load, slide overlay out
    overlay.classList.remove('is-entering');
    if (performance.navigation && performance.navigation.type === 1) return; // skip on reload
    if (sessionStorage.getItem('page-transition')) {
      overlay.style.transform = 'translateY(0)';
      overlay.style.transition = 'none';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.style.transition = '';
          overlay.classList.add('is-leaving');
          setTimeout(() => {
            overlay.classList.remove('is-leaving');
            overlay.style.transform = '';
          }, 700);
        });
      });
    }
    sessionStorage.setItem('page-transition', '1');
  }
  return { init };
})();

/* === MODULE V8 : SCROLL THEME TRANSITION === */
const ScrollTheme = (() => {
  function init() {
    const sections = document.querySelectorAll('[data-scroll-theme]');
    if (!sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const theme = entry.target.dataset.scrollTheme;
        const manual = localStorage.getItem('portfolio-theme');
        if (manual) return;
        document.documentElement.setAttribute('data-theme', theme);
      });
    }, { threshold: 0.45, rootMargin: '-10% 0px -10% 0px' });
    sections.forEach(el => observer.observe(el));
  }
  return { init };
})();

/* === INIT V8 MODULES === */
Loader.init();
CustomCursor.init();
PageTransitions.init();
ScrollTheme.init();

/* === MODULE V8 : LANGUAGE SELECTOR + TRANSLATIONS === */
const LangSelector = (() => {
  const translations = {
    fr: {
      // NAV
      'nav.home': 'Accueil', 'nav.about': 'À propos', 'nav.projects': 'Projets', 'nav.skills': 'Compétences', 'nav.contact': 'Contact',
      // HERO
      'hero.greeting': '👋 Salut, moi c\'est',
      'hero.subtitle': 'Étudiant en BUT MMI, je crée des identités visuelles percutantes, des interfaces soignées et des supports de communication qui marquent les esprits.',
      'hero.badge': 'Disponible pour un stage ou une alternance',
      // VIDÉO CV (homepage)
      'videocv.label': 'Vidéo CV',
      'videocv.title': 'Mon profil en 25\u00a0secondes',
      'videocv.desc': 'Lecture muette par défaut : activez le son 🔊 pour le sound design (effets sonores, sans voix). Présentation, compétences, projets et contact.',
      'videocv.transcriptTitle': 'Transcription textuelle',
      'videocv.transcript': 'Chrisnaël Berdier — designer graphique, développeur web, direction artistique. Étudiant en 2e année de BUT MMI, parcours Création numérique, à l\'Université des Antilles. Je cherche une alternance, disponible dès maintenant en Guadeloupe. Compétences : Photoshop, Figma, Canva, HTML/CSS, JavaScript, montage vidéo (CapCut), accessibilité numérique (RGAA 4.1). Projets sélectionnés : couverture de magazine « Icone » (Canva), affiche d\'exposition « James Gill, Pop Art Legacy » (Photoshop), affiche de concert « Tame Impala » style Swiss (Canva), affiche de film « Peaky Blinders : L\'Immortel » (Photoshop), ainsi que des sites web (HTML, CSS, JS, WordPress, Astro) — plus de 10 projets réalisés. Travaillons ensemble : chrisnaelberdier.com, berdierchrisnael@gmail.com, +590 690 94 14 49, LinkedIn : Chrisnaël Berdier.',
      // CARTE DES COMPÉTENCES (homepage)
      'skills.label': 'Savoir-faire',
      'skills.mapTitle': 'Mon parcours de compétences',
      'skills.mapIntro': 'Chaque niveau débloqué correspond à un projet réalisé. Sélectionnez un niveau pour voir la preuve.',
      'skills.w1': 'Design graphique',
      'skills.w2': 'Développement web',
      'skills.w3': 'Vidéo',
      'skills.w4': 'UX et accessibilité',
      'skills.state.done': 'Maîtrisé',
      'skills.state.progress': 'En progression',
      'skills.state.locked': 'À débloquer',
      'skills.open': 'Voir le projet',
      'skills.legend': 'Légende',
      'skills.replay': 'Rejouer le parcours',
      'skills.goalTitle': 'Niveau suivant',
      'skills.goalText': 'Votre entreprise ?',
      'skills.goalCta': 'Débloquer ce niveau',
      'skills.n.typo': 'Typographie',
      'skills.n.video': 'Montage vidéo',
      'skills.n.ux': 'Recherche UX',
      'skills.n.a11y': 'Accessibilité RGAA',
      'skills.p.canva': 'Couverture magazine « Icone »',
      'skills.p.typo': 'Affiche de concert Tame Impala, style Swiss',
      'skills.p.photoshop': 'Affiche d\'exposition James Gill, Pop Art Legacy',
      'skills.p.figma': 'Maquettes et prototypes d\'interfaces',
      'skills.p.next': 'Prochain niveau : à débloquer en alternance',
      'skills.p.html': 'Site Marëis, protection marine',
      'skills.p.js': 'Landing page AirPods Pro 3, animations GSAP',
      'skills.p.wp': 'Boutique The Sillies (WooCommerce)',
      'skills.p.astro': 'Guide « Mon voyage à Paris »',
      'skills.p.video': 'Production audiovisuelle sur CapCut',
      'skills.p.ux': 'Personas et parcours utilisateurs',
      'skills.p.a11y': 'Ce site : navigation clavier, contrastes, widget d\'accessibilité',
      // ABOUT (homepage)
      'about.label': 'À propos',
      'about.title': 'Le design au service du\u00a0sens',
      'about.p1': 'Étudiant en BUT Métiers du Multimédia et de l\'Internet, je me spécialise en design graphique et communication visuelle. Mon approche mêle créativité, rigueur typographique et sensibilité esthétique pour concevoir des visuels et des identités qui racontent une histoire.',
      'about.p2': 'Passionné par la direction artistique, je m\'investis autant dans la recherche UX que dans la création d\'affiches, de logos et d\'univers visuels cohérents. L\'accessibilité est au cœur de ma démarche.',
      'about.cta': 'En savoir plus',
      'stat.projects': 'Projets réalisés', 'stat.degree': 'BAC+2 en cours', 'stat.tools': 'Outils maîtrisés',
      // PROJETS PAGE
      'projets.title': 'Mes projets', 'projets.subtitle': 'Production graphique, développement web et audiovisuel',
      'projets.search': 'Rechercher un projet…', 'projets.empty': 'Aucun projet ne correspond à votre recherche.',
      'filter.all': 'Tous', 'filter.graphic': 'Production graphique', 'filter.web': 'Développement web', 'filter.video': 'Audio & Vidéo',
      // A PROPOS PAGE
      'apropos.title': 'À propos', 'apropos.subtitle': 'Mon parcours, mes valeurs, ma vision du design', 'apropos.name': 'Chrisnaël Berdier',
      'apropos.p1': 'J\'ai 19 ans et je suis actuellement en première année de BUT Métiers du Multimédia et de l\'Internet à l\'Université des Antilles, campus de Saint-Claude en Guadeloupe. Avant cela, j\'ai débuté par une L1 Humanités qui m\'a apporté une solide base en réflexion et communication.',
      'apropos.p2': 'Ma passion pour le design graphique s\'exprime à travers la création d\'identités visuelles, de compositions typographiques et de supports de communication. Je suis convaincu que le design est un langage : chaque couleur, chaque forme, chaque espace a un sens.',
      'apropos.p3': 'En parallèle de mes études, j\'ai acquis de l\'expérience professionnelle en tant qu\'hôte de caisse chez Carrefour Milenis et vendeur chez Be Sport. Ces expériences m\'ont appris la rigueur, le travail d\'équipe et la relation client.',
      'apropos.p4': 'Dynamique et motivé, je suis à la recherche d\'un stage ou d\'une alternance en design graphique, direction artistique ou communication visuelle.',
      'apropos.dl': 'Télécharger mon CV', 'apropos.view': 'Visualiser le CV', 'apropos.contact': 'Me contacter',
      'val.precision': 'Précision', 'val.a11y': 'Accessibilité', 'val.creative': 'Créativité',
      // SKILLS PAGE
      'skills.title': 'Mes compétences',
      // CONTACT PAGE
      'contact.title': 'Me contacter',
      // FOOTER
      'footer.legal': 'Mentions légales'
    },
    en: {
      'nav.home': 'Home', 'nav.about': 'About', 'nav.projects': 'Projects', 'nav.skills': 'Skills', 'nav.contact': 'Contact',
      'hero.greeting': '👋 Hi, I\'m',
      'hero.subtitle': 'Multimedia & Internet student, I create striking visual identities, refined interfaces and communication materials that leave a lasting impression.',
      'hero.badge': 'Available for internship or work-study',
      'videocv.label': 'Video CV',
      'videocv.title': 'My profile in 25\u00a0seconds',
      'videocv.desc': 'Plays muted by default: turn the sound on 🔊 for the sound design (sound effects only, no voice). Introduction, skills, projects and contact.',
      'videocv.transcriptTitle': 'Text transcript',
      'videocv.transcript': 'Chrisnaël Berdier — graphic designer, web developer, art direction. Second-year student in BUT MMI (Multimedia & Internet), Digital Creation track, at the Université des Antilles. I\'m looking for a work-study placement, available now in Guadeloupe, France. Skills: Photoshop, Figma, Canva, HTML/CSS, JavaScript, video editing (CapCut), digital accessibility (WCAG / RGAA). Selected projects: “Icone” magazine cover (Canva), “James Gill, Pop Art Legacy” exhibition poster (Photoshop), “Tame Impala” Swiss-style concert poster (Canva), “Peaky Blinders: L\'Immortel” film poster (Photoshop), plus websites (HTML, CSS, JS, WordPress, Astro) — 10+ projects completed. Let\'s work together: chrisnaelberdier.com, berdierchrisnael@gmail.com, +590 690 94 14 49, LinkedIn: Chrisnaël Berdier.',
      'skills.label': 'Know-how',
      'skills.mapTitle': 'My skills journey',
      'skills.mapIntro': 'Every unlocked level matches a finished project. Select a level to see the proof.',
      'skills.w1': 'Graphic design',
      'skills.w2': 'Web development',
      'skills.w3': 'Video',
      'skills.w4': 'UX and accessibility',
      'skills.state.done': 'Mastered',
      'skills.state.progress': 'In progress',
      'skills.state.locked': 'To unlock',
      'skills.open': 'View project',
      'skills.legend': 'Legend',
      'skills.replay': 'Replay the journey',
      'skills.goalTitle': 'Next level',
      'skills.goalText': 'Your company?',
      'skills.goalCta': 'Unlock this level',
      'skills.n.typo': 'Typography',
      'skills.n.video': 'Video editing',
      'skills.n.ux': 'UX research',
      'skills.n.a11y': 'Accessibility (RGAA)',
      'skills.p.canva': '“Icone” magazine cover',
      'skills.p.typo': 'Swiss-style Tame Impala concert poster',
      'skills.p.photoshop': 'James Gill “Pop Art Legacy” exhibition poster',
      'skills.p.figma': 'Interface mockups and prototypes',
      'skills.p.next': 'Next level: to unlock during my work-study',
      'skills.p.html': 'Marëis website, marine protection',
      'skills.p.js': 'AirPods Pro 3 landing page, GSAP animations',
      'skills.p.wp': 'The Sillies online shop (WooCommerce)',
      'skills.p.astro': '“Mon voyage à Paris” travel guide',
      'skills.p.video': 'Video production on CapCut',
      'skills.p.ux': 'Personas and user journeys',
      'skills.p.a11y': 'This site: keyboard navigation, contrast, accessibility widget',
      'about.label': 'About',
      'about.title': 'Design in service of\u00a0meaning',
      'about.p1': 'Multimedia & Internet student, I specialize in graphic design and visual communication. My approach blends creativity, typographic precision and aesthetic sensibility to craft visuals and identities that tell a story.',
      'about.p2': 'Passionate about art direction, I invest equally in UX research and in creating posters, logos and cohesive visual universes. Accessibility is at the heart of my process.',
      'about.cta': 'Learn more',
      'stat.projects': 'Projects completed', 'stat.degree': 'BAC+2 in progress', 'stat.tools': 'Tools mastered',
      'projets.title': 'My projects', 'projets.subtitle': 'Graphic design, web development and audiovisual',
      'projets.search': 'Search a project…', 'projets.empty': 'No project matches your search.',
      'filter.all': 'All', 'filter.graphic': 'Graphic design', 'filter.web': 'Web development', 'filter.video': 'Audio & Video',
      'apropos.title': 'About', 'apropos.subtitle': 'My journey, my values, my vision of design', 'apropos.name': 'Chrisnaël Berdier',
      'apropos.p1': 'I am 19 years old and currently a first-year student in Multimedia & Internet at the Université des Antilles, Saint-Claude campus in Guadeloupe. Before that, I started with a first year in Humanities which gave me a solid foundation in critical thinking and communication.',
      'apropos.p2': 'My passion for graphic design comes through in creating visual identities, typographic compositions and communication materials. I am convinced that design is a language: every color, every shape, every space has meaning.',
      'apropos.p3': 'Alongside my studies, I gained professional experience as a cashier at Carrefour Milenis and a sales associate at Be Sport. These experiences taught me discipline, teamwork and customer relations.',
      'apropos.p4': 'Dynamic and motivated, I am looking for an internship or work-study in graphic design, art direction or visual communication.',
      'apropos.dl': 'Download my CV', 'apropos.view': 'View CV', 'apropos.contact': 'Contact me',
      'val.precision': 'Precision', 'val.a11y': 'Accessibility', 'val.creative': 'Creativity',
      'skills.title': 'My skills',
      'contact.title': 'Contact me',
      'footer.legal': 'Legal notice'
    },
    es: {
      'nav.home': 'Inicio', 'nav.about': 'Sobre mí', 'nav.projects': 'Proyectos', 'nav.skills': 'Habilidades', 'nav.contact': 'Contacto',
      'hero.greeting': '👋 Hola, soy',
      'hero.subtitle': 'Estudiante de Multimedia e Internet, creo identidades visuales impactantes, interfaces cuidadas y materiales de comunicación que dejan huella.',
      'hero.badge': 'Disponible para prácticas o alternancia',
      'videocv.label': 'Vídeo CV',
      'videocv.title': 'Mi perfil en 25\u00a0segundos',
      'videocv.desc': 'Se reproduce sin sonido por defecto: activa el sonido 🔊 para el diseño sonoro (solo efectos, sin voz). Vídeo en inglés: presentación, habilidades, proyectos y contacto.',
      'videocv.transcriptTitle': 'Transcripción textual',
      'videocv.transcript': 'Chrisnaël Berdier — diseñador gráfico, desarrollador web, dirección artística. Estudiante de segundo año de BUT MMI (Multimedia e Internet), itinerario Creación Digital, en la Université des Antilles. Busco una alternancia (formación en alternancia), disponible ahora mismo en Guadalupe. Habilidades: Photoshop, Figma, Canva, HTML/CSS, JavaScript, edición de vídeo (CapCut), accesibilidad digital (WCAG / RGAA). Proyectos seleccionados: portada de revista «Icone» (Canva), cartel de exposición «James Gill, Pop Art Legacy» (Photoshop), cartel de concierto «Tame Impala» estilo suizo (Canva), cartel de película «Peaky Blinders: L\'Immortel» (Photoshop), además de sitios web (HTML, CSS, JS, WordPress, Astro) — más de 10 proyectos realizados. Trabajemos juntos: chrisnaelberdier.com, berdierchrisnael@gmail.com, +590 690 94 14 49, LinkedIn: Chrisnaël Berdier.',
      'skills.label': 'Saber hacer',
      'skills.mapTitle': 'Mi recorrido de habilidades',
      'skills.mapIntro': 'Cada nivel desbloqueado corresponde a un proyecto realizado. Selecciona un nivel para ver la prueba.',
      'skills.w1': 'Diseño gráfico',
      'skills.w2': 'Desarrollo web',
      'skills.w3': 'Vídeo',
      'skills.w4': 'UX y accesibilidad',
      'skills.state.done': 'Dominado',
      'skills.state.progress': 'En progreso',
      'skills.state.locked': 'Por desbloquear',
      'skills.open': 'Ver el proyecto',
      'skills.legend': 'Leyenda',
      'skills.replay': 'Repetir el recorrido',
      'skills.goalTitle': 'Siguiente nivel',
      'skills.goalText': '¿Su empresa?',
      'skills.goalCta': 'Desbloquear este nivel',
      'skills.n.typo': 'Tipografía',
      'skills.n.video': 'Edición de vídeo',
      'skills.n.ux': 'Investigación UX',
      'skills.n.a11y': 'Accesibilidad (RGAA)',
      'skills.p.canva': 'Portada de revista «Icone»',
      'skills.p.typo': 'Cartel de concierto Tame Impala, estilo suizo',
      'skills.p.photoshop': 'Cartel de exposición James Gill, Pop Art Legacy',
      'skills.p.figma': 'Maquetas y prototipos de interfaces',
      'skills.p.next': 'Siguiente nivel: por desbloquear en alternancia',
      'skills.p.html': 'Sitio Marëis, protección marina',
      'skills.p.js': 'Landing page AirPods Pro 3, animaciones GSAP',
      'skills.p.wp': 'Tienda The Sillies (WooCommerce)',
      'skills.p.astro': 'Guía «Mon voyage à Paris»',
      'skills.p.video': 'Producción audiovisual en CapCut',
      'skills.p.ux': 'Personas y recorridos de usuario',
      'skills.p.a11y': 'Este sitio: navegación con teclado, contrastes, widget de accesibilidad',
      'about.label': 'Sobre mí',
      'about.title': 'Diseño al servicio del\u00a0sentido',
      'about.p1': 'Estudiante de Multimedia e Internet, me especializo en diseño gráfico y comunicación visual. Mi enfoque combina creatividad, rigor tipográfico y sensibilidad estética para crear visuales e identidades que cuentan una historia.',
      'about.p2': 'Apasionado por la dirección artística, me involucro tanto en la investigación UX como en la creación de carteles, logotipos y universos visuales coherentes. La accesibilidad está en el corazón de mi proceso.',
      'about.cta': 'Saber más',
      'stat.projects': 'Proyectos realizados', 'stat.degree': 'BAC+2 en curso', 'stat.tools': 'Herramientas dominadas',
      'projets.title': 'Mis proyectos', 'projets.subtitle': 'Diseño gráfico, desarrollo web y audiovisual',
      'projets.search': 'Buscar un proyecto…', 'projets.empty': 'Ningún proyecto coincide con su búsqueda.',
      'filter.all': 'Todos', 'filter.graphic': 'Diseño gráfico', 'filter.web': 'Desarrollo web', 'filter.video': 'Audio y vídeo',
      'apropos.title': 'Sobre mí', 'apropos.subtitle': 'Mi trayectoria, mis valores, mi visión del diseño', 'apropos.name': 'Chrisnaël Berdier',
      'apropos.p1': 'Tengo 19 años y actualmente estoy en primer año de Multimedia e Internet en la Université des Antilles, campus de Saint-Claude en Guadalupe. Antes, empecé con un primer año en Humanidades que me dio una sólida base en reflexión y comunicación.',
      'apropos.p2': 'Mi pasión por el diseño gráfico se expresa a través de la creación de identidades visuales, composiciones tipográficas y materiales de comunicación. Estoy convencido de que el diseño es un lenguaje: cada color, cada forma, cada espacio tiene un significado.',
      'apropos.p3': 'Paralelamente a mis estudios, adquirí experiencia profesional como cajero en Carrefour Milenis y vendedor en Be Sport. Estas experiencias me enseñaron rigor, trabajo en equipo y atención al cliente.',
      'apropos.p4': 'Dinámico y motivado, busco unas prácticas o alternancia en diseño gráfico, dirección artística o comunicación visual.',
      'apropos.dl': 'Descargar mi CV', 'apropos.view': 'Ver CV', 'apropos.contact': 'Contactarme',
      'val.precision': 'Precisión', 'val.a11y': 'Accesibilidad', 'val.creative': 'Creatividad',
      'skills.title': 'Mis habilidades',
      'contact.title': 'Contactarme',
      'footer.legal': 'Aviso legal'
    }
  };

  function applyTranslations(lang) {
    const dict = translations[lang];
    if (!dict) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        // Preserve SVG icons inside buttons/links
        const svg = el.querySelector('svg');
        if (svg) {
          const svgClone = svg.cloneNode(true);
          el.textContent = dict[key] + ' ';
          el.appendChild(svgClone);
        } else {
          el.innerHTML = dict[key];
        }
      }
    });
    // Handle placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) el.setAttribute('placeholder', dict[key]);
    });
    // Prévient les autres modules (ex. VideoCV) du changement de langue
    document.dispatchEvent(new CustomEvent('portfolio:langchange', { detail: { lang } }));
  }

  function init() {
    const selector = document.getElementById('lang-selector');
    const btn = document.getElementById('lang-btn');
    if (!selector || !btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selector.classList.toggle('is-open');
    });
    document.addEventListener('click', () => { selector.classList.remove('is-open'); });

    selector.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = opt.dataset.lang;
        selector.querySelectorAll('.lang-option').forEach(o => o.classList.remove('is-active'));
        opt.classList.add('is-active');
        selector.classList.remove('is-open');
        document.documentElement.setAttribute('lang', lang);
        localStorage.setItem('portfolio-lang', lang);
        applyTranslations(lang);
      });
    });

    const saved = localStorage.getItem('portfolio-lang');
    if (saved && saved !== 'fr') {
      document.documentElement.setAttribute('lang', saved);
      selector.querySelectorAll('.lang-option').forEach(o => {
        o.classList.toggle('is-active', o.dataset.lang === saved);
      });
      applyTranslations(saved);
    }
  }
  return { init };
})();

LangSelector.init();

/* === MODULE V9 : VIDÉO CV (langue + lecture auto) === */
const VideoCV = (() => {
  // FR a sa propre version ; EN et ES utilisent la version anglaise
  const SOURCES = {
    fr: { src: 'assets/video/video-cv-fr.mp4', poster: 'assets/video/video-cv-poster-fr.jpg' },
    en: { src: 'assets/video/video-cv-en.mp4', poster: 'assets/video/video-cv-poster-en.jpg' }
  };
  let video = null;
  let userPaused = false;
  let autoPausing = false;

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.body.classList.contains('reduce-motion');
  }

  function setLang(lang) {
    const source = SOURCES[lang] || SOURCES.en;
    if (video.getAttribute('src') === source.src) return;
    const wasPlaying = !video.paused;
    video.setAttribute('poster', source.poster);
    video.setAttribute('src', source.src);
    video.load();
    if (wasPlaying) video.play().catch(() => {});
  }

  function init() {
    video = document.getElementById('video-cv-player');
    if (!video) return;
    setLang(localStorage.getItem('portfolio-lang') || 'fr');
    document.addEventListener('portfolio:langchange', (e) => setLang(e.detail.lang));

    // Une pause demandée par l'utilisateur n'est pas annulée par le scroll
    video.addEventListener('pause', () => { if (!autoPausing) userPaused = true; autoPausing = false; });
    video.addEventListener('play', () => { userPaused = false; });

    // Lecture muette seulement quand la vidéo est visible à 50 %
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!userPaused && !reducedMotion()) video.play().catch(() => {});
      } else if (!video.paused) {
        autoPausing = true;
        video.pause();
      }
    }, { threshold: 0.5 });
    observer.observe(video);
  }
  return { init };
})();

VideoCV.init();

/* === MODULE V10 : CARTE DE PARCOURS DES COMPÉTENCES (SkillMap) ===
   Transforme la liste #skill-map en carte de jeu : une île par monde, un
   chemin pointillé, et le carré orange du logo « C. » qui avance de niveau
   en niveau en les débloquant (petit saut + gerbe de carrés).
   - Grand écran (≥ 1000 px) : parcours horizontal, lancé quand la carte
     est visible à 35 %.
   - Écran étroit : parcours vertical qui avance avec le scroll.
   - Réduire animations / prefers-reduced-motion : tout est débloqué d'emblée.
   Les niveaux restent de vrais <button> dans une liste ordonnée (clavier,
   lecteurs d'écran) ; l'SVG est décoratif (aria-hidden). */
const SkillMap = (() => {
  const WIDE_MIN = 1000;
  const SPEED = { wide: 620, tall: 900 };      // px de chemin par seconde (~5 s pour tout le parcours)
  const PAUSE = { reach: 110, locked: 300 };   // arrêt sur un niveau (ms)
  let map, svg, worlds, levels, goal, replayBtn, pathEl, revealEl, playerEl;
  let stops = [], samples = [], total = 0;
  let mode = 'wide', len = 0, target = 0, reached = 0, pauseUntil = 0, raf = 0, last = 0, visible = false;

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.body.classList.contains('reduce-motion');
  const f = (v) => v.toFixed(1);

  // Aléatoire à graine fixe : les îles gardent la même forme à chaque visite
  function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  // Segments de Bézier d'une courbe lisse (Catmull-Rom) passant par les points
  function curve(p, closed) {
    const n = p.length, segs = [];
    const at = (i) => closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))];
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = at(i - 1), b = at(i), c = at(i + 1), e = at(i + 2);
      segs.push([b, 'C' + f(b[0] + (c[0] - a[0]) / 6) + ',' + f(b[1] + (c[1] - a[1]) / 6) + ' ' +
        f(c[0] - (e[0] - b[0]) / 6) + ',' + f(c[1] - (e[1] - b[1]) / 6) + ' ' + f(c[0]) + ',' + f(c[1])]);
    }
    return segs;
  }
  const pathD = (segs, closed) => 'M' + f(segs[0][0][0]) + ',' + f(segs[0][0][1]) + ' ' + segs.map((s) => s[1]).join(' ') + (closed ? ' Z' : '');

  // Île : forme « super-ellipse » bosselée autour d'un rectangle
  function island(box, seed) {
    const r = rng(seed), cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
    const rx = (box[2] - box[0]) / 2, ry = (box[3] - box[1]) / 2, pts = [];
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2 + (r() - 0.5) * 0.5, j = 1 + (r() - 0.5) * 0.3;
      const c = Math.cos(a), s = Math.sin(a);
      pts.push([cx + Math.sign(c) * Math.pow(Math.abs(c), 0.8) * rx * j, cy + Math.sign(s) * Math.pow(Math.abs(s), 0.8) * ry * j]);
    }
    return { pts, cx, cy, rx, ry, r };
  }

  const isLocked = (i) => levels[i - 1] && levels[i - 1].dataset.state === 'locked';
  const place = (el, x, y) => { el.style.setProperty('--x', f(x) + 'px'); el.style.setProperty('--y', f(y) + 'px'); };

  function layout() {
    const W = map.clientWidth;
    if (!W) return;
    mode = W >= WIDE_MIN ? 'wide' : 'tall';
    const groups = worlds.map((w) => [...w.querySelectorAll('.skill-map__level')]);
    const nodes = [], firsts = [];
    let H, start, goalPt;
    const mid = 195; // ligne médiane du parcours horizontal

    if (mode === 'wide') {
      // Niveaux en alternance haut/bas ; le niveau final a sa propre zone à droite
      H = 370;
      const amp = 120, left = 34, goalZone = 270, gap = 1.2;
      const lanes = [0.55, -0.55, 0.45, -0.5, 0.6, -0.45];
      const u = (W - left - goalZone - 40) / (levels.length + (groups.length - 1) * gap);
      let x = left, k = 0;
      start = [left, mid];
      groups.forEach((g, gi) => {
        if (gi > 0) x += gap * u;
        g.forEach(() => { x += u; nodes.push([x, mid + amp * lanes[k % lanes.length]]); k++; });
      });
      // Château à la hauteur du dernier niveau : le chemin arrive à plat, le texte reste dessous
      goalPt = [W - goalZone / 2, nodes[nodes.length - 1][1]];
      H = Math.max(370, goalPt[1] + 150);
    } else {
      // Zigzag vertical ; d'un monde à l'autre le chemin descend tout droit sur la
      // même voie, et le titre du monde se place de l'autre côté, au-dessus de l'île
      const step = 96, gap = 112, lanes = [0.28, 0.72];
      let y = 118, lane = 1;
      start = [W * lanes[lane], 22];
      groups.forEach((g, gi) => {
        if (gi > 0) y += step + gap;
        g.forEach((_, i) => {
          if (i > 0) { y += step; lane = 1 - lane; }
          nodes.push([W * lanes[lane], y]);
        });
      });
      goalPt = [W * 0.5, y + 170];
      H = goalPt[1] + 150;
    }
    map.style.setProperty('--map-h', H + 'px');
    map.classList.toggle('is-wide', mode === 'wide');

    // Niveaux + carte d'info (décalée pour ne pas sortir de la carte)
    levels.forEach((li, i) => {
      const [x, y] = nodes[i];
      place(li, x, y);
      li.style.setProperty('--card-shift', f(Math.max(0, 125 - x) + Math.min(0, W - 125 - x)) + 'px');
      // Grand écran : nom et fiche vers l'extérieur du chemin (haut → au-dessus / fiche dessous)
      li.classList.toggle('is-label-above', mode === 'wide' && y < mid);
      li.classList.toggle('is-card-below', mode === 'wide' ? y < mid : y < 175);
    });

    // Îles + titres des mondes
    let art = '', n = 0;
    groups.forEach((g, gi) => {
      const pts = nodes.slice(n, n + g.length); n += g.length;
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      let box;
      if (mode === 'wide') {
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2, half = Math.max(90, (Math.max(...xs) - Math.min(...xs)) / 2 + 46);
        box = [cx - half, Math.min(...ys) - 58, cx + half, Math.max(...ys) + 62];
        place(worlds[gi].querySelector('.skill-map__world-title'), box[0] + 8, box[1] - 34);
      } else {
        box = [W * 0.05, Math.min(...ys) - 52, W * 0.95, Math.max(...ys) + 72];
        const title = worlds[gi].querySelector('.skill-map__world-title');
        const pathOnLeft = pts[0][0] < W / 2;
        title.classList.toggle('is-title-right', pathOnLeft);
        title.style.setProperty('--title-max', f(W * 0.72 - 30) + 'px');
        place(title, pathOnLeft ? W - 4 : 4, box[1] - 6);
      }
      const isl = island(box, 11 + gi * 17), c = (gi % 4) + 1;
      art += '<path class="skill-map__island skill-map__island--' + c + '" d="' + pathD(curve(isl.pts, true), true) + '"/>';
      const coast = isl.pts.map(([x, y]) => [isl.cx + (x - isl.cx) * 1.06 + 4, isl.cy + (y - isl.cy) * 1.08 + 3]);
      art += '<path class="skill-map__coast skill-map__coast--' + c + '" d="' + pathD(curve(coast, true), true) + '"/>';
      for (let k = 0; k < 5; k++) {
        const a = isl.r() * Math.PI * 2;
        art += '<circle class="skill-map__dot" r="' + f(1.6 + isl.r() * 1.6) + '" cx="' + f(isl.cx + Math.cos(a) * isl.rx * 0.86) + '" cy="' + f(isl.cy + Math.sin(a) * isl.ry * 0.86) + '"/>';
      }
    });

    // Chemin départ → niveaux → château
    const all = [start, ...nodes, goalPt], segs = curve(all, false), d = pathD(segs, false);
    const [gx, gy] = goalPt;
    art += '<ellipse class="skill-map__island skill-map__island--1" cx="' + f(gx) + '" cy="' + f(gy + 4) + '" rx="64" ry="16"/>' +
      '<defs><mask id="skill-map-reveal"><path class="skill-map__reveal" d="' + d + '"/></mask></defs>' +
      '<path class="skill-map__trail" d="' + d + '"/><path class="skill-map__progress" d="' + d + '" mask="url(#skill-map-reveal)"/>' +
      '<circle class="skill-map__start" r="6" cx="' + f(start[0]) + '" cy="' + f(start[1]) + '"/>' +
      '<g transform="translate(' + f(gx) + ' ' + f(gy) + ')">' +
        '<line class="skill-map__pole" x1="0" y1="-58" x2="0" y2="-96"/>' +
        '<path class="skill-map__flag" d="M1,-96 L27,-88 L1,-80 Z"/>' +
        '<path class="skill-map__castle" d="M-28,0 V-38 H-21 V-45 H-14 V-38 H-7 V-45 H7 V-38 H14 V-45 H21 V-38 H28 V0 Z"/>' +
        '<path class="skill-map__castle" d="M-11,-38 V-54 H-11 V-60 H-5 V-54 H5 V-60 H11 V-54 H11 V-38 Z"/>' +
        '<path class="skill-map__castle-door" d="M-7,0 V-11 A7,7 0 0 1 7,-11 V0 Z"/>' +
      '</g>' +
      '<g class="skill-map__player"><circle class="skill-map__player-glow" r="17"/><rect class="skill-map__player-body" x="-8" y="-8" width="16" height="16" rx="3.5"/></g>';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = art;
    pathEl = svg.querySelector('.skill-map__trail');
    revealEl = svg.querySelector('.skill-map__reveal');
    playerEl = svg.querySelector('.skill-map__player');

    // Longueur du chemin à chaque niveau (segment par segment)
    const probe = svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
    stops = [0];
    segs.forEach((s) => { probe.setAttribute('d', 'M' + f(s[0][0]) + ',' + f(s[0][1]) + ' ' + s[1]); stops.push(stops[stops.length - 1] + probe.getTotalLength()); });
    probe.remove();
    total = stops[stops.length - 1];
    revealEl.style.strokeDasharray = total + ' ' + total;
    samples = [];
    for (let l = 0; l <= total; l += total / 300) { const p = pathEl.getPointAtLength(l); samples.push([l, p.y]); }

    // Niveau final : château, puis « Niveau suivant » et l'invitation en dessous
    const gTitle = goal.querySelector('.skill-map__world-title'), gBox = goal.querySelector('.skill-map__goal');
    const clampX = (el) => { const h = el.offsetWidth / 2 + 4; return Math.min(Math.max(gx, h), W - h); };
    place(gTitle, clampX(gTitle), gy + 26);
    place(gBox, clampX(gBox), gy + 52);

    // Reprend là où en était le joueur
    len = Math.min(stops[reached] || 0, total);
    if (map.classList.contains('is-complete')) len = total;
    target = len;
    draw();
    updateTarget();
    run();
  }

  function draw() {
    if (!pathEl) return;
    revealEl.style.strokeDashoffset = f(total - len);
    const p = pathEl.getPointAtLength(len);
    const a = stops[reached] || 0, b = stops[Math.min(reached + 1, stops.length - 1)];
    const t = b > a ? Math.min(1, Math.max(0, (len - a) / (b - a))) : 0;
    const hop = Math.sin(Math.PI * t) * (mode === 'wide' ? 16 : 12);
    const turn = 90 * (reached + (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2));
    playerEl.setAttribute('transform', 'translate(' + f(p.x) + ' ' + f(p.y - hop) + ') rotate(' + f(turn) + ')');
  }

  function reach(i) {
    reached = i;
    if (i === stops.length - 1) {
      map.classList.add('is-complete');
      if (replayBtn && !reduced()) replayBtn.hidden = false;
      return;
    }
    const li = levels[i - 1];
    if (!li) return;
    li.classList.add('is-reached');
    if (li.dataset.state !== 'locked') {
      li.classList.remove('is-bursting');
      void li.offsetWidth; // relance l'animation CSS
      li.classList.add('is-bursting');
      setTimeout(() => li.classList.remove('is-bursting'), 900);
    }
  }

  function finish() {
    levels.forEach((li) => li.classList.add('is-reached'));
    map.classList.add('is-complete');
    reached = stops.length - 1;
    len = target = total;
    draw();
  }

  function tick(now) {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    if (reduced()) { finish(); return; }
    if (now < pauseUntil) { raf = requestAnimationFrame(tick); return; }
    if (len >= target) { last = 0; return; }
    const next = Math.min(target, len + SPEED[mode] * dt), ni = reached + 1;
    if (ni < stops.length && next >= stops[ni]) {
      len = stops[ni];
      reach(ni);
      pauseUntil = now + (isLocked(ni) ? PAUSE.locked : PAUSE.reach);
    } else {
      len = next;
    }
    draw();
    raf = requestAnimationFrame(tick);
  }
  const run = () => { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };

  // Jusqu'où le joueur a le droit d'aller
  function updateTarget() {
    if (mode === 'wide') { if (visible) target = total; return; }
    const line = window.innerHeight * 0.7 - map.getBoundingClientRect().top;
    let t = 0;
    samples.forEach(([l, y]) => { if (y <= line && l > t) t = l; });
    target = Math.max(target, t);
  }

  function replay() {
    levels.forEach((li) => li.classList.remove('is-reached', 'is-bursting'));
    map.classList.remove('is-complete');
    len = target = 0; reached = 0; pauseUntil = 0;
    draw();
    updateTarget();
    run();
  }

  function closeCards(except) {
    levels.forEach((li) => {
      if (li !== except && li.classList.contains('is-open')) {
        li.classList.remove('is-open');
        li.querySelector('.skill-map__node').setAttribute('aria-expanded', 'false');
      }
    });
  }
  function toggleCard(li) {
    const open = !li.classList.contains('is-open');
    closeCards(li);
    li.classList.toggle('is-open', open);
    li.querySelector('.skill-map__node').setAttribute('aria-expanded', String(open));
  }

  function init() {
    map = document.getElementById('skill-map');
    if (!map) return;
    worlds = [...map.querySelectorAll('.skill-map__world:not(.skill-map__world--goal)')];
    levels = [...map.querySelectorAll('.skill-map__level')];
    goal = map.querySelector('.skill-map__world--goal');
    replayBtn = document.getElementById('skill-map-replay');

    levels.forEach((li) => {
      for (let k = 0; k < 6; k++) {
        const b = document.createElement('span'), a = (k / 6) * Math.PI * 2 + 0.4, dist = 30 + (k % 2) * 16;
        b.className = 'skill-map__burst';
        b.setAttribute('aria-hidden', 'true');
        b.style.setProperty('--dx', f(Math.cos(a) * dist) + 'px');
        b.style.setProperty('--dy', f(Math.sin(a) * dist) + 'px');
        li.appendChild(b);
      }
      li.querySelector('.skill-map__node').addEventListener('click', () => toggleCard(li));
      const openBtn = li.querySelector('.skill-map__open');
      if (openBtn) openBtn.addEventListener('click', () => ProjectModal.open(openBtn));
    });

    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'skill-map__art');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    map.insertBefore(svg, map.firstChild);
    map.classList.add('is-map');
    layout();
    if (reduced()) finish();

    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && e.intersectionRatio >= 0.35;
      if (visible) { updateTarget(); run(); }
    }, { threshold: [0, 0.35] }).observe(map);
    window.addEventListener('scroll', () => { if (mode === 'tall') { updateTarget(); run(); } }, { passive: true });
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 150); });
    window.addEventListener('load', layout);
    document.addEventListener('portfolio:langchange', layout);
    if (replayBtn) replayBtn.addEventListener('click', replay);

    document.addEventListener('keydown', (e) => {
      // La fenêtre projet gère son propre Échap (et rend le focus au bouton « Voir le projet »)
      if (e.key !== 'Escape' || document.querySelector('.project-modal-overlay.is-open')) return;
      const open = levels.find((li) => li.classList.contains('is-open'));
      if (open) { closeCards(); open.querySelector('.skill-map__node').focus(); }
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.skill-map__level')) closeCards(); });
  }
  return { init };
})();

SkillMap.init();

