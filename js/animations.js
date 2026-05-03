/* ================================================================
   ANIMATIONS.JS — GSAP + ScrollTrigger + Lenis
   Portfolio Chrisnaël Berdier — Expérience scroll premium
   ================================================================ */

(function () {
  'use strict';

  /* ─── GUARDS ──────────────────────────────────────────────── */
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = !window.matchMedia('(pointer: fine)').matches;

  /* Signale au CSS que GSAP prend la main → désactive les transitions CSS des .reveal */
  document.body.classList.add('gsap-ready');

  /* ─── 1. LENIS SMOOTH SCROLL ───────────────────────────────── */
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !isReducedMotion) {
    lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.5,
      infinite: false,
    });

    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);
  }

  /* ─── UTILS ────────────────────────────────────────────────── */

  /* Enveloppe chaque "ligne" d'un titre dans un overflow:hidden pour le clip reveal */
  function wrapLines(el) {
    if (el.dataset.linesWrapped) return el.querySelectorAll('.gsap-line-inner');
    el.dataset.linesWrapped = '1';
    const parts = el.innerHTML.split(/<br\s*\/?>/gi);
    el.innerHTML = parts.map(p =>
      `<span class="gsap-line"><span class="gsap-line-inner">${p}</span></span>`
    ).join('');
    return el.querySelectorAll('.gsap-line-inner');
  }

  /* Attend que le loader soit masqué, puis appelle cb */
  function afterLoader(cb) {
    const loader = document.getElementById('site-loader');
    if (!loader || loader.classList.contains('is-hidden')) {
      setTimeout(cb, 120);
      return;
    }
    const obs = new MutationObserver(() => {
      if (loader.classList.contains('is-hidden')) {
        obs.disconnect();
        setTimeout(cb, 100);
      }
    });
    obs.observe(loader, { attributes: true, attributeFilter: ['class'] });
    setTimeout(cb, 4500); // fallback absolu
  }

  /* ─── 2. HERO — TIMELINE D'ENTRÉE ─────────────────────────── */
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
    const orb        = hero.querySelector('.hero__orb');
    const rings      = hero.querySelectorAll('.hero__rings span');

    /* ── États initiaux posés IMMÉDIATEMENT (inline styles > CSS classes)
       → Aucun flash visible pendant le chargement du loader              */
    if (orb)        gsap.set(orb,        { scale: 0.35, opacity: 0, filter: 'blur(20px)' });
    if (rings.length) gsap.set(rings,    { scale: 0.5,  opacity: 0 });
    if (greeting)   gsap.set(greeting,   { y: 28, opacity: 0 });
    if (highlight)  gsap.set(highlight,  { clipPath: 'inset(0 100% 0 0)', opacity: 1 });
    if (subtitle)   gsap.set(subtitle,   { y: 32,  opacity: 0, filter: 'blur(12px)' });
    if (badge)      gsap.set(badge,      { scale: 0.72, opacity: 0, y: 18 });
    if (ctas.length) gsap.set(ctas,      { y: 42, opacity: 0 });
    if (scrollHint) gsap.set(scrollHint, { opacity: 0 });

    /* Chars du titre (splitté par SplitText de main.js — appelé au DOMContentLoaded)
       → on attend un tick pour qu'ils soient bien générés */
    requestAnimationFrame(() => {
      const chars = titleName ? titleName.querySelectorAll('.split-char') : [];
      if (chars.length) gsap.set(chars, { y: '120%', rotation: 12, opacity: 0 });
      else if (titleName) gsap.set(titleName, { y: 70, opacity: 0 });
    });

    /* ── Timeline d'animation, déclenchée après la disparition du loader */
    afterLoader(() => {
      const chars = titleName ? titleName.querySelectorAll('.split-char') : [];
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      /* Orb — apparition élastique */
      if (orb) {
        tl.to(orb, {
          scale: 1, opacity: 1, filter: 'blur(0px)',
          duration: 2.4, ease: 'elastic.out(1, 0.5)'
        }, 0);
      }

      /* Rings — apparition progressive */
      if (rings.length) {
        tl.to(rings, {
          scale: 1, opacity: 'auto',
          duration: 2.2, stagger: 0.28, ease: 'power2.out'
        }, 0.15);
      }

      /* Greeting pill */
      if (greeting) {
        tl.to(greeting, { y: 0, opacity: 1, duration: 0.85 }, 0.45);
      }

      /* Caractères du titre */
      if (chars.length) {
        tl.to(chars, {
          y: '0%', rotation: 0, opacity: 1,
          duration: 1.5, stagger: 0.022, ease: 'power4.out'
        }, 0.6);
      } else if (titleName) {
        tl.to(titleName, { y: 0, opacity: 1, duration: 1.2 }, 0.6);
      }

      /* "Designer Graphique" — reveal clip de gauche à droite */
      if (highlight) {
        tl.to(highlight, {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.1, ease: 'power3.inOut'
        }, 1.15);
      }

      /* Sous-titre avec déflou */
      if (subtitle) {
        tl.to(subtitle, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1 }, 1.35);
      }

      /* Badge disponibilité */
      if (badge) {
        tl.to(badge, {
          scale: 1, opacity: 1, y: 0, duration: 0.85, ease: 'back.out(2)'
        }, 1.55);
      }

      /* Boutons CTA */
      if (ctas.length) {
        tl.to(ctas, {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.14, ease: 'power3.out'
        }, 1.7);
      }

      /* Indicateur scroll */
      if (scrollHint) {
        tl.to(scrollHint, { opacity: 1, duration: 0.8 }, 2.4);
      }
    });
  }

  /* ─── 3. PAGE HEADERS (pages secondaires) ──────────────────── */
  function initPageHeaders() {
    const header = document.querySelector('.page-header');
    if (!header || isReducedMotion) return;

    const label    = header.querySelector('.section__label');
    const title    = header.querySelector('.page-header__title');
    const subtitle = header.querySelector('.page-header__subtitle');

    /* États initiaux immédiats */
    if (label)    gsap.set(label,    { x: -45, opacity: 0 });
    if (subtitle) gsap.set(subtitle, { y: 30,  opacity: 0, filter: 'blur(8px)' });
    if (title) {
      const lines = wrapLines(title);
      gsap.set(lines, { y: '115%', opacity: 0 });
    }

    afterLoader(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      if (label) tl.to(label, { x: 0, opacity: 1, duration: 0.85 }, 0.25);
      if (title) {
        const lines = title.querySelectorAll('.gsap-line-inner');
        tl.to(lines, { y: '0%', opacity: 1, duration: 1.3, stagger: 0.1 }, 0.4);
      }
      if (subtitle) tl.to(subtitle, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1 }, 0.85);
    });
  }

  /* ─── 4. SECTION LABELS ────────────────────────────────────── */
  function initSectionLabels() {
    document.querySelectorAll('.section__label').forEach(el => {
      if (el.closest('.page-header')) return;
      gsap.from(el, {
        x: -50,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* ─── 5. SECTION TITLES — LIGNE PAR LIGNE ──────────────────── */
  function initSectionTitles() {
    document.querySelectorAll('.section__title, .page-header__title').forEach(el => {
      if (el.closest('.hero') || el.closest('.page-header')) return;
      if (el.dataset.splitText) return; // déjà géré par SplitText hero
      const lines = wrapLines(el);
      if (!lines.length) return;
      gsap.set(el, { opacity: 1 });
      gsap.from(lines, {
        y: '115%',
        opacity: 0,
        duration: 1.15,
        stagger: 0.13,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* ─── 6. ÉLÉMENTS .reveal GENERIQUES ──────────────────────── */
  function initRevealElements() {
    document.querySelectorAll('.reveal').forEach(el => {
      /* Skip les éléments gérés par leurs propres fonctions spécialisées */
      if (
        el.closest('.hero') ||
        el.closest('.about__stats') ||
        el.closest('.projects__grid') ||
        el.classList.contains('about__image-wrap') ||
        el.classList.contains('section__label') ||
        el.classList.contains('section__title') ||
        el.classList.contains('page-header__title')
      ) return;

      const staggerDelay =
        el.classList.contains('stagger-1') ? 0.06 :
        el.classList.contains('stagger-2') ? 0.20 :
        el.classList.contains('stagger-3') ? 0.34 :
        el.classList.contains('stagger-4') ? 0.48 : 0;

      gsap.from(el, {
        y: 65,
        opacity: 0,
        duration: 1.1,
        delay: staggerDelay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 89%', once: true }
      });
    });
  }

  /* ─── 7. IMAGE ABOUT — RIDEAU + PARALLAX ──────────────────── */
  function initAboutImages() {
    document.querySelectorAll('.about__image-wrap').forEach(wrap => {
      /* Rideau horizontal (clip-path) */
      gsap.fromTo(wrap,
        { clipPath: 'inset(0 100% 0 0 round 24px)', opacity: 1 },
        {
          clipPath: 'inset(0 0% 0 0 round 24px)',
          duration: 1.5,
          ease: 'power4.inOut',
          scrollTrigger: { trigger: wrap, start: 'top 82%', once: true }
        }
      );

      /* Parallax de l'image à l'intérieur */
      const img = wrap.querySelector('img');
      if (img && !isTouch) {
        gsap.fromTo(img,
          { yPercent: 8 },
          {
            yPercent: -8,
            ease: 'none',
            scrollTrigger: {
              trigger: wrap,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 2,
            }
          }
        );
      }
    });
  }

  /* ─── 8. CARTES PROJET — STAGGER CINÉTIQUE ─────────────────── */
  function initProjectCards() {
    document.querySelectorAll('.projects__grid').forEach(grid => {
      const cards = grid.querySelectorAll('.project-card');
      gsap.from(cards, {
        y: 110,
        opacity: 0,
        scale: 0.88,
        duration: 1.15,
        stagger: { amount: 0.55, from: 'start' },
        ease: 'power3.out',
        scrollTrigger: { trigger: grid, start: 'top 87%', once: true }
      });
    });
  }

  /* ─── 9. STATISTIQUES ──────────────────────────────────────── */
  function initStats() {
    document.querySelectorAll('.about__stats').forEach(wrap => {
      const stats = wrap.querySelectorAll('.stat');
      gsap.from(stats, {
        y: 55,
        opacity: 0,
        scale: 0.80,
        duration: 0.95,
        stagger: 0.14,
        ease: 'back.out(1.8)',
        scrollTrigger: { trigger: wrap, start: 'top 85%', once: true }
      });
    });
  }

  /* ─── 10. CARTES VALEURS (à propos) ───────────────────────── */
  function initValueCards() {
    const wrap = document.querySelector('.about-page-values');
    if (!wrap) return;
    gsap.from(wrap.querySelectorAll('.value-card'), {
      y: 90,
      opacity: 0,
      duration: 1.05,
      stagger: 0.14,
      ease: 'power3.out',
      scrollTrigger: { trigger: wrap, start: 'top 85%', once: true }
    });
  }

  /* ─── 11. CATÉGORIES COMPÉTENCES — ALTERNANCE GAUCHE/DROITE ── */
  function initSkillCategories() {
    document.querySelectorAll('.skill-category').forEach((cat, i) => {
      gsap.from(cat, {
        x: i % 2 === 0 ? -75 : 75,
        opacity: 0,
        duration: 1.05,
        ease: 'power3.out',
        scrollTrigger: { trigger: cat, start: 'top 88%', once: true }
      });
    });
  }

  /* ─── 12. ITEMS CONTACT ────────────────────────────────────── */
  function initContactItems() {
    const items = document.querySelectorAll('.contact__item');
    if (!items.length) return;
    gsap.from(items, {
      x: -70,
      opacity: 0,
      duration: 0.95,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: items[0].parentElement, start: 'top 85%', once: true }
    });
  }

  /* ─── 13. FORMULAIRE CONTACT ──────────────────────────────── */
  function initContactForm() {
    const form = document.querySelector('.contact__form');
    if (!form) return;
    gsap.from(form, {
      y: 70, opacity: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: form, start: 'top 86%', once: true }
    });
    gsap.from(form.querySelectorAll('.form-group, .form-status + .btn, .btn'), {
      y: 28, opacity: 0, duration: 0.7, stagger: 0.09, ease: 'power2.out',
      scrollTrigger: { trigger: form, start: 'top 80%', once: true }
    });
  }

  /* ─── 14. BOUTONS FILTRES ─────────────────────────────────── */
  function initFilterButtons() {
    const wrap = document.querySelector('.projects__filters');
    if (!wrap) return;
    gsap.from(wrap.querySelectorAll('.filter-btn'), {
      y: 32, opacity: 0, scale: 0.88, duration: 0.7,
      stagger: 0.07, ease: 'back.out(1.5)',
      scrollTrigger: { trigger: wrap, start: 'top 90%', once: true }
    });
  }

  /* ─── 15. MARQUEE VELOCITY ────────────────────────────────── */
  function initMarqueeVelocity() {
    const marquee = document.querySelector('.marquee-strip__inner');
    if (!marquee) return;

    const BASE = 28;
    let current = BASE, target = BASE;

    if (lenis) {
      lenis.on('scroll', ({ velocity }) => {
        target = Math.max(6, BASE - Math.abs(velocity) * 9);
      });
    } else {
      let lastY = 0, lastT = 0;
      window.addEventListener('scroll', () => {
        const now = performance.now();
        const v = (window.scrollY - lastY) / Math.max(1, now - lastT) * 16;
        target = Math.max(6, BASE - Math.abs(v) * 9);
        lastY = window.scrollY; lastT = now;
      }, { passive: true });
    }

    function tick() {
      current  += (target - current) * 0.06;
      target   += (BASE - target) * 0.025; // decay vers la vitesse de base
      marquee.style.animationDuration = current.toFixed(2) + 's';
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ─── 16. PARALLAX HERO (rings + orb + content) ──────────── */
  function initHeroParallax() {
    const hero = document.querySelector('.hero');
    if (!hero || isTouch || isReducedMotion) return;

    hero.querySelectorAll('.hero__rings span').forEach((ring, i) => {
      gsap.to(ring, {
        y: (i + 1) * -90,
        ease: 'none',
        scrollTrigger: {
          trigger: hero, start: 'top top', end: 'bottom top',
          scrub: 0.8 + i * 0.35,
        }
      });
    });

    const orb = hero.querySelector('.hero__orb');
    if (orb) {
      gsap.to(orb, {
        y: -100, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.2 }
      });
    }

    const content = hero.querySelector('.hero__content');
    if (content) {
      gsap.to(content, {
        y: -55, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 }
      });
    }
  }

  /* ─── 17. SECTION HORIZONTAL SCROLL (showcase) ─────────────── */
  function initHorizontalScroll() {
    const section = document.querySelector('.hsection');
    const track   = document.querySelector('.hsection__track');
    if (!section || !track) return;

    const panels = track.querySelectorAll('.hsection__panel');
    if (panels.length < 2) return;

    /* Distance de défilement = largeur de tous les panels hors viewport */
    const getScrollDist = () => track.scrollWidth - window.innerWidth;

    /* Animation principale : translate X sur le track */
    const hAnim = gsap.to(track, {
      x: () => -getScrollDist(),
      ease: 'none',
    });

    /* ScrollTrigger pinné — pilote l'animation via scrub */
    const hST = ScrollTrigger.create({
      id: 'hscroll',
      trigger: section,
      pin: true,
      scrub: 1.0,
      start: 'top top',
      end: () => '+=' + getScrollDist(),
      animation: hAnim,
      invalidateOnRefresh: true,
    });

    /* Hint "Faites défiler" qui s'efface rapidement */
    const hint = section.querySelector('.hsection__hint');
    if (hint) {
      gsap.to(hint, {
        opacity: 0, duration: 0.4, ease: 'power2.in',
        scrollTrigger: {
          trigger: section, start: 'top top', end: '+=180',
          scrub: true,
        }
      });
    }

    /* Compteur de panel courant */
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

    /* Captions : fade-in quand le panel entre dans le viewport horizontal */
    panels.forEach(panel => {
      const caption = panel.querySelector('.hsection__caption');
      if (!caption) return;
      gsap.from(caption, {
        y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: {
          trigger: panel,
          containerAnimation: hAnim,
          start: 'left 85%',
          once: true,
        }
      });
    });
  }

  /* ─── 18. FOOTER ──────────────────────────────────────────── */
  function initFooter() {
    const footer = document.querySelector('.footer');
    if (!footer) return;
    const inner = footer.querySelector('.footer__inner') || footer;
    gsap.from(inner, {
      y: 40, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: footer, start: 'top 96%', once: true }
    });
  }

  /* ─── 19. PROJETS SEARCH BAR ──────────────────────────────── */
  function initProjectsSearch() {
    const searchWrap = document.querySelector('.projects__search-centered');
    if (!searchWrap) return;
    gsap.from(searchWrap, {
      y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: searchWrap, start: 'top 90%', once: true }
    });
  }

  /* ─── 20. PARAGRAPHES ABOUT TEXT ──────────────────────────── */
  function initAboutText() {
    document.querySelectorAll('.about__text').forEach(wrap => {
      /* Seuls les <p> qui ne font pas déjà partie d'un .reveal géré */
      const paras = Array.from(wrap.querySelectorAll('p')).filter(p =>
        !p.classList.contains('section__label') &&
        !p.classList.contains('reveal')
      );
      if (!paras.length) return;
      gsap.from(paras, {
        y: 42, opacity: 0, duration: 0.9, stagger: 0.14, ease: 'power3.out',
        scrollTrigger: { trigger: wrap, start: 'top 86%', once: true }
      });
    });
  }

  /* ─── INITIALISATION ──────────────────────────────────────── */
  function init() {
    /* Éléments de page (hero / header) — états initiaux posés en premier */
    initHero();
    initPageHeaders();

    /* Éléments génériques scroll-revealed */
    initSectionLabels();
    initSectionTitles();
    initRevealElements();

    /* Composants spécifiques */
    initAboutImages();
    initAboutText();
    initProjectCards();
    initStats();
    initValueCards();
    initSkillCategories();
    initContactItems();
    initContactForm();
    initFilterButtons();
    initProjectsSearch();

    /* Effets scroll spéciaux */
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
