/* ================================================================
   ANIMATIONS.JS — GSAP + ScrollTrigger + Lenis
   Portfolio Chrisnaël Berdier — v2 : fix perf + mobile + hero
   ================================================================ */

(function () {
  'use strict';

  /* ─── GUARDS ──────────────────────────────────────────────── */
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = !window.matchMedia('(pointer: fine)').matches;

  document.body.classList.add('gsap-ready');

  /* ─── 1. LENIS — desktop uniquement ───────────────────────── */
  /* Sur iOS/Android le scroll natif est déjà fluide + Lenis+pin = conflits */
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !isReducedMotion && !isTouch) {
    lenis = new Lenis({
      duration: 1.1,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.8,
      infinite: false,
    });
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);
  }

  /* ─── UTILS ────────────────────────────────────────────────── */

  function wrapLines(el) {
    if (el.dataset.linesWrapped) return el.querySelectorAll('.gsap-line-inner');
    el.dataset.linesWrapped = '1';
    const parts = el.innerHTML.split(/<br\s*\/?>/gi);
    el.innerHTML = parts.map(p =>
      `<span class="gsap-line"><span class="gsap-line-inner">${p}</span></span>`
    ).join('');
    return el.querySelectorAll('.gsap-line-inner');
  }

  function afterLoader(cb) {
    const loader = document.getElementById('site-loader');
    if (!loader || loader.classList.contains('is-hidden')) { setTimeout(cb, 80); return; }
    const obs = new MutationObserver(() => {
      if (loader.classList.contains('is-hidden')) { obs.disconnect(); setTimeout(cb, 80); }
    });
    obs.observe(loader, { attributes: true, attributeFilter: ['class'] });
    setTimeout(cb, 4500);
  }

  /* ─── 2. HERO ─────────────────────────────────────────────── */
  function initHero() {
    const hero = document.querySelector('.hero');
    if (!hero || isReducedMotion) return;

    const greeting   = hero.querySelector('.hero__greeting');
    const titleName  = hero.querySelector('.hero__title-name');
    const highlight  = hero.querySelector('.highlight');
    const subtitle   = hero.querySelector('.hero__subtitle');
    const badge      = hero.querySelector('.badge-dispo');
    const ctas       = hero.querySelectorAll('.hero__cta .btn');
    const scrollHint = hero.querySelector('.hero__scroll');
    /* Nouveaux éléments géométriques */
    const geos       = hero.querySelectorAll('.hero__geo');
    const ring       = hero.querySelector('.hero__ring');
    const dot        = hero.querySelector('.hero__dot');

    /* États initiaux — PAS de filter:blur (trop lourd GPU sur mobile) */
    if (geos.length) gsap.set(geos,  { opacity: 0, scale: 0.8 });
    if (ring)        gsap.set(ring,  { opacity: 0, scale: 0.7 });
    if (dot)         gsap.set(dot,   { opacity: 0, scale: 0 });
    if (greeting)    gsap.set(greeting,  { y: 28, opacity: 0 });
    if (highlight)   gsap.set(highlight, { clipPath: 'inset(0 100% 0 0)', opacity: 1 });
    if (subtitle)    gsap.set(subtitle,  { y: 28, opacity: 0 });
    if (badge)       gsap.set(badge,     { scale: 0.75, opacity: 0, y: 16 });
    if (ctas.length) gsap.set(ctas,      { y: 38, opacity: 0 });
    if (scrollHint)  gsap.set(scrollHint,{ opacity: 0 });

    requestAnimationFrame(() => {
      const chars = titleName ? titleName.querySelectorAll('.split-char') : [];
      if (chars.length) gsap.set(chars, { y: '115%', rotation: 10, opacity: 0 });
      else if (titleName) gsap.set(titleName, { y: 60, opacity: 0 });
    });

    afterLoader(() => {
      const chars = titleName ? titleName.querySelectorAll('.split-char') : [];
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      /* Formes géométriques */
      if (geos.length) {
        tl.to(geos, { opacity: 1, scale: 1, duration: 1.6, stagger: 0.18, ease: 'power2.out' }, 0);
      }
      if (ring) tl.to(ring, { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' }, 0.1);
      if (dot)  tl.to(dot,  { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(2)' }, 0.6);

      /* Greeting */
      if (greeting) tl.to(greeting, { y: 0, opacity: 1, duration: 0.8 }, 0.5);

      /* Titre */
      if (chars.length) {
        tl.to(chars, { y: '0%', rotation: 0, opacity: 1, duration: 1.4, stagger: 0.02, ease: 'power4.out' }, 0.6);
      } else if (titleName) {
        tl.to(titleName, { y: 0, opacity: 1, duration: 1.1 }, 0.6);
      }

      /* "Designer Graphique" clip reveal */
      if (highlight) {
        tl.to(highlight, { clipPath: 'inset(0 0% 0 0)', duration: 1.0, ease: 'power3.inOut' }, 1.1);
      }

      /* Sous-titre — simple opacity+y, pas de blur */
      if (subtitle) tl.to(subtitle, { y: 0, opacity: 1, duration: 1.0 }, 1.3);
      if (badge)    tl.to(badge,    { scale: 1, opacity: 1, y: 0, duration: 0.75, ease: 'back.out(2)' }, 1.5);
      if (ctas.length) tl.to(ctas, { y: 0, opacity: 1, duration: 0.85, stagger: 0.13 }, 1.65);
      if (scrollHint)  tl.to(scrollHint, { opacity: 1, duration: 0.7 }, 2.3);
    });
  }

  /* ─── 3. PAGE HEADERS ─────────────────────────────────────── */
  function initPageHeaders() {
    const header = document.querySelector('.page-header');
    if (!header || isReducedMotion) return;

    const label    = header.querySelector('.section__label');
    const title    = header.querySelector('.page-header__title');
    const subtitle = header.querySelector('.page-header__subtitle');

    if (label)    gsap.set(label,    { x: -40, opacity: 0 });
    if (subtitle) gsap.set(subtitle, { y: 26,  opacity: 0 });
    if (title) {
      const lines = wrapLines(title);
      gsap.set(lines, { y: '110%', opacity: 0 });
    }

    afterLoader(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      if (label) tl.to(label, { x: 0, opacity: 1, duration: 0.8 }, 0.2);
      if (title) {
        const lines = title.querySelectorAll('.gsap-line-inner');
        tl.to(lines, { y: '0%', opacity: 1, duration: 1.2, stagger: 0.1 }, 0.35);
      }
      if (subtitle) tl.to(subtitle, { y: 0, opacity: 1, duration: 0.9 }, 0.8);
    });
  }

  /* ─── 4. SECTION LABELS ────────────────────────────────────── */
  function initSectionLabels() {
    document.querySelectorAll('.section__label').forEach(el => {
      if (el.closest('.page-header')) return;
      gsap.from(el, {
        x: -45, opacity: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* ─── 5. SECTION TITLES ────────────────────────────────────── */
  function initSectionTitles() {
    document.querySelectorAll('.section__title, .page-header__title').forEach(el => {
      if (el.closest('.hero') || el.closest('.page-header')) return;
      if (el.dataset.splitText) return;
      const lines = wrapLines(el);
      if (!lines.length) return;
      gsap.set(el, { opacity: 1 });
      gsap.from(lines, {
        y: '110%', opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* ─── 6. RÉVÉLATION GÉNÉRIQUE ──────────────────────────────── */
  function initRevealElements() {
    document.querySelectorAll('.reveal').forEach(el => {
      if (
        el.closest('.hero') ||
        el.closest('.about__stats') ||
        el.closest('.projects__grid') ||
        el.classList.contains('about__image-wrap') ||
        el.classList.contains('section__label') ||
        el.classList.contains('section__title') ||
        el.classList.contains('page-header__title')
      ) return;

      const d = el.classList.contains('stagger-1') ? 0.06
              : el.classList.contains('stagger-2') ? 0.20
              : el.classList.contains('stagger-3') ? 0.34
              : el.classList.contains('stagger-4') ? 0.48 : 0;

      gsap.from(el, {
        y: 60, opacity: 0, duration: 1.0, delay: d, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 89%', once: true }
      });
    });
  }

  /* ─── 7. IMAGE ABOUT — RIDEAU ──────────────────────────────── */
  function initAboutImages() {
    document.querySelectorAll('.about__image-wrap').forEach(wrap => {
      gsap.fromTo(wrap,
        { clipPath: 'inset(0 100% 0 0 round 24px)', opacity: 1 },
        {
          clipPath: 'inset(0 0% 0 0 round 24px)', duration: 1.4, ease: 'power4.inOut',
          scrollTrigger: { trigger: wrap, start: 'top 82%', once: true }
        }
      );
      const img = wrap.querySelector('img');
      if (img && !isTouch) {
        gsap.fromTo(img, { yPercent: 7 }, {
          yPercent: -7, ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: 2 }
        });
      }
    });
  }

  /* ─── 8. CARTES PROJET ─────────────────────────────────────── */
  function initProjectCards() {
    document.querySelectorAll('.projects__grid').forEach(grid => {
      gsap.from(grid.querySelectorAll('.project-card'), {
        y: 100, opacity: 0, scale: 0.9, duration: 1.0,
        stagger: { amount: 0.5, from: 'start' }, ease: 'power3.out',
        scrollTrigger: { trigger: grid, start: 'top 87%', once: true }
      });
    });
  }

  /* ─── 9. STATS ─────────────────────────────────────────────── */
  function initStats() {
    document.querySelectorAll('.about__stats').forEach(wrap => {
      gsap.from(wrap.querySelectorAll('.stat'), {
        y: 50, opacity: 0, scale: 0.82, duration: 0.85, stagger: 0.13, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: wrap, start: 'top 85%', once: true }
      });
    });
  }

  /* ─── 10. VALUE CARDS ──────────────────────────────────────── */
  function initValueCards() {
    const wrap = document.querySelector('.about-page-values');
    if (!wrap) return;
    gsap.from(wrap.querySelectorAll('.value-card'), {
      y: 80, opacity: 0, duration: 1.0, stagger: 0.13, ease: 'power3.out',
      scrollTrigger: { trigger: wrap, start: 'top 85%', once: true }
    });
  }

  /* ─── 11. COMPÉTENCES ──────────────────────────────────────── */
  function initSkillCategories() {
    document.querySelectorAll('.skill-category').forEach((cat, i) => {
      gsap.from(cat, {
        x: i % 2 === 0 ? -65 : 65, opacity: 0, duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: cat, start: 'top 88%', once: true }
      });
    });
  }

  /* ─── 12. CONTACT ITEMS ────────────────────────────────────── */
  function initContactItems() {
    const items = document.querySelectorAll('.contact__item');
    if (!items.length) return;
    gsap.from(items, {
      x: -60, opacity: 0, duration: 0.9, stagger: 0.11, ease: 'power3.out',
      scrollTrigger: { trigger: items[0].parentElement, start: 'top 85%', once: true }
    });
  }

  /* ─── 13. FORMULAIRE CONTACT ───────────────────────────────── */
  function initContactForm() {
    const form = document.querySelector('.contact__form');
    if (!form) return;
    gsap.from(form, {
      y: 65, opacity: 0, duration: 1.0, ease: 'power3.out',
      scrollTrigger: { trigger: form, start: 'top 86%', once: true }
    });
    gsap.from(form.querySelectorAll('.form-group'), {
      y: 25, opacity: 0, duration: 0.65, stagger: 0.09, ease: 'power2.out',
      scrollTrigger: { trigger: form, start: 'top 80%', once: true }
    });
  }

  /* ─── 14. FILTRES ──────────────────────────────────────────── */
  function initFilterButtons() {
    const wrap = document.querySelector('.projects__filters');
    if (!wrap) return;
    gsap.from(wrap.querySelectorAll('.filter-btn'), {
      y: 28, opacity: 0, scale: 0.88, duration: 0.65, stagger: 0.07, ease: 'back.out(1.5)',
      scrollTrigger: { trigger: wrap, start: 'top 90%', once: true }
    });
  }

  /* ─── 15. MARQUEE VELOCITY ─────────────────────────────────── */
  function initMarqueeVelocity() {
    const marquee = document.querySelector('.marquee-strip__inner');
    if (!marquee) return;
    const BASE = 28;
    let current = BASE, target = BASE;
    if (lenis) {
      lenis.on('scroll', ({ velocity }) => {
        target = Math.max(8, BASE - Math.abs(velocity) * 8);
      });
    } else {
      let lastY = 0, lastT = 0;
      window.addEventListener('scroll', () => {
        const now = performance.now();
        const v = Math.abs((window.scrollY - lastY) / Math.max(1, now - lastT) * 16);
        target = Math.max(8, BASE - v * 8);
        lastY = window.scrollY; lastT = now;
      }, { passive: true });
    }
    function tick() {
      current += (target - current) * 0.06;
      target  += (BASE - target)   * 0.025;
      marquee.style.animationDuration = current.toFixed(2) + 's';
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ─── 16. PARALLAX HERO ─────────────────────────────────────── */
  function initHeroParallax() {
    const hero = document.querySelector('.hero');
    if (!hero || isTouch || isReducedMotion) return;

    /* Formes géométriques : profondeurs différentes */
    const geos = hero.querySelectorAll('.hero__geo');
    geos.forEach((geo, i) => {
      gsap.to(geo, {
        y: -(50 + i * 30), ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 + i * 0.3 }
      });
    });

    const ring = hero.querySelector('.hero__ring');
    if (ring) {
      gsap.to(ring, {
        y: -80, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.2 }
      });
    }

    const content = hero.querySelector('.hero__content');
    if (content) {
      gsap.to(content, {
        y: -45, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5 }
      });
    }
  }

  /* ─── 17. SCROLL HORIZONTAL ────────────────────────────────── */
  function initHorizontalScroll() {
    const section = document.querySelector('.hsection');
    const track   = document.querySelector('.hsection__track');
    if (!section || !track) return;

    const panels = track.querySelectorAll('.hsection__panel');
    if (panels.length < 2) return;

    /* Sur touch : scroll natif CSS (déjà géré par le CSS via .hsection--touch) */
    if (isTouch) {
      section.classList.add('hsection--touch');
      /* Captions en fade simple */
      panels.forEach(panel => {
        const caption = panel.querySelector('.hsection__caption');
        if (caption) gsap.set(caption, { opacity: 1, y: 0 });
      });
      return;
    }

    const getScrollDist = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const hAnim = gsap.to(track, { x: () => -getScrollDist(), ease: 'none' });

    ScrollTrigger.create({
      trigger: section,
      pin: true,
      scrub: 0.9,
      start: 'top top',
      end: () => '+=' + getScrollDist(),
      animation: hAnim,
      invalidateOnRefresh: true,
    });

    /* Hint */
    const hint = section.querySelector('.hsection__hint');
    if (hint) {
      gsap.to(hint, {
        opacity: 0, duration: 0.4,
        scrollTrigger: { trigger: section, start: 'top top', end: '+=150', scrub: true }
      });
    }

    /* Compteur */
    const counter = section.querySelector('.hsection__counter');
    if (counter) {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => '+=' + getScrollDist(),
        scrub: true,
        onUpdate: self => {
          const idx = Math.round(self.progress * (panels.length - 1)) + 1;
          counter.textContent = '0' + idx + ' / 0' + panels.length;
        }
      });
    }

    /* Captions */
    panels.forEach(panel => {
      const caption = panel.querySelector('.hsection__caption');
      if (!caption) return;
      gsap.from(caption, {
        y: 45, opacity: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: panel, containerAnimation: hAnim, start: 'left 90%', once: true }
      });
    });
  }

  /* ─── 18. FOOTER ───────────────────────────────────────────── */
  function initFooter() {
    const footer = document.querySelector('.footer');
    if (!footer) return;
    gsap.from(footer.querySelector('.footer__inner') || footer, {
      y: 36, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: footer, start: 'top 96%', once: true }
    });
  }

  /* ─── 19. ABOUT TEXT ───────────────────────────────────────── */
  function initAboutText() {
    document.querySelectorAll('.about__text').forEach(wrap => {
      const paras = Array.from(wrap.querySelectorAll('p')).filter(p =>
        !p.classList.contains('section__label') && !p.classList.contains('reveal')
      );
      if (!paras.length) return;
      gsap.from(paras, {
        y: 38, opacity: 0, duration: 0.85, stagger: 0.13, ease: 'power3.out',
        scrollTrigger: { trigger: wrap, start: 'top 86%', once: true }
      });
    });
  }

  /* ─── INIT ─────────────────────────────────────────────────── */
  function init() {
    initHero();
    initPageHeaders();
    initSectionLabels();
    initSectionTitles();
    initRevealElements();
    initAboutImages();
    initAboutText();
    initProjectCards();
    initStats();
    initValueCards();
    initSkillCategories();
    initContactItems();
    initContactForm();
    initFilterButtons();
    initMarqueeVelocity();
    if (!isReducedMotion) initHeroParallax();
    initHorizontalScroll();
    initFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
