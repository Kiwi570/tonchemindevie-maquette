/* Ton chemin de vie : moteur commun des trois pages */
(() => {
  'use strict';
  const html = document.documentElement;
  const D = window.TCV;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const estCalme = () => html.classList.contains('calme');
  const tactile = matchMedia('(hover: none), (pointer: coarse)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const T = (window.TCVsite = { estCalme, $, $$, ecouteurs: [] });

  /* ---------- utilitaires ---------- */
  const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } };
  const ssGet = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  const ssSet = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  T.clamp = clamp; T.lerp = lerp;

  T.img = (nom, alt = '', sizes = '100vw', cls = '') => {
    const t = (window.TCV_IMG || {})[nom];
    if (!t) return '';
    const mid = t.filter((s) => s <= 1280).pop() || t[0];
    const ss = t.map((s) => `assets/img/${nom}-${s}.webp ${s}w`).join(', ');
    return `<img src="assets/img/${nom}-${mid}.webp" srcset="${ss}" sizes="${sizes}" alt="${alt}" loading="lazy" decoding="async"${cls ? ` class="${cls}"` : ''}>`;
  };

  const moisFr = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const jourFr = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  /* dates affichées à l’heure de Bruxelles, quel que soit le fuseau du visiteur */
  const partsBxl = (iso) => {
    const d = new Date(iso);
    const f = new Intl.DateTimeFormat('fr-BE', { timeZone: 'Europe/Brussels', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
    return p;
  };
  T.dateLongue = (iso) => { const p = partsBxl(iso); return `${p.weekday} ${p.day === '1' ? '1er' : p.day} ${p.month} ${p.year}`; };
  const abr = { janvier: 'janv.', février: 'févr.', mars: 'mars', avril: 'avr.', mai: 'mai', juin: 'juin', juillet: 'juil.', août: 'août', septembre: 'sept.', octobre: 'oct.', novembre: 'nov.', décembre: 'déc.' };
  T.dateCourte = (iso) => { const p = partsBxl(iso); return { jour: p.day, mois: abr[p.month] || p.month, moisLong: p.month, annee: p.year, semaine: p.weekday }; };

  /* Journées triées automatiquement */
  T.journees = () => {
    const now = Date.now();
    const avenir = [], passees = [];
    D.journees.forEach((j) => {
      if (j.date) (new Date(j.fin || j.date).getTime() > now ? avenir : passees).push(j);
      else (j.passee ? passees : avenir).push(j);
    });
    avenir.sort((a, b) => new Date(a.date) - new Date(b.date));
    passees.sort((a, b) => (b.date ? new Date(b.date) : 0) - (a.date ? new Date(a.date) : 0));
    return { avenir, passees };
  };
  T.dateJournee = (j) => (j.date ? T.dateLongue(j.date) : `organisée en ${j.mois}`);

  /* ---------- Mode calme ---------- */
  const btnCalme = $$('[data-calme]');
  const majBtnCalme = () => btnCalme.forEach((b) => b.setAttribute('aria-pressed', estCalme() ? 'true' : 'false'));
  majBtnCalme();
  btnCalme.forEach((b) => b.addEventListener('click', () => {
    const on = !estCalme();
    html.classList.toggle('calme', on);
    lsSet('tcv-calme', on ? '1' : '0');
    majBtnCalme();
    if (on) arreterAnimations(); else demarrerAnimations();
    window.dispatchEvent(new CustomEvent('tcv:calme', { detail: on }));
  }));

  /* ---------- défilement fluide ---------- */
  let lenis = null;
  T.lenis = () => lenis;
  function demarrerLenis() {
    if (lenis || estCalme() || typeof window.Lenis === 'undefined') return;
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(rafLenis);
      gsap.ticker.lagSmoothing(0);
    } else {
      const loop = (t) => { if (!lenis) return; lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }
  function rafLenis(t) { if (lenis) lenis.raf(t * 1000); }
  function arreterLenis() { if (!lenis) return; if (hasGsap) gsap.ticker.remove(rafLenis); lenis.destroy(); lenis = null; }
  T.vitesse = () => (lenis ? lenis.velocity : 0);

  /* ancres internes : défilement doux avec décalage d’en-tête */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    let hash = null;
    if (href.startsWith('#')) hash = href;
    else {
      try {
        const u = new URL(href, location.href);
        if (u.origin === location.origin && u.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') === location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') && u.hash) hash = u.hash;
      } catch (err) { /* lien ignoré */ }
    }
    if (!hash || hash === '#') return;
    const cible = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!cible) return;
    e.preventDefault();
    fermerMenu();
    if (lenis) lenis.scrollTo(cible, { offset: -90, duration: 1.4 });
    else cible.scrollIntoView({ behavior: estCalme() ? 'auto' : 'smooth' });
    history.pushState(null, '', hash);
    if (cible.tabIndex < 0 && !/^(A|BUTTON|INPUT)$/.test(cible.tagName)) cible.setAttribute('tabindex', '-1');
    setTimeout(() => cible.focus({ preventScroll: true }), estCalme() ? 0 : 900);
  });

  /* transitions entre les pages */
  const voile = $('.voile');
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
    let u;
    try { u = new URL(a.href, location.href); } catch (err) { return; }
    if (u.origin !== location.origin || !/\.html$|\/$/.test(u.pathname) || (u.pathname === location.pathname && u.hash)) return;
    if (u.href === location.href) return;
    if (estCalme() || !voile) return;
    e.preventDefault();
    voile.classList.add('entre');
    setTimeout(() => { location.href = u.href; }, 520);
  });
  window.addEventListener('pageshow', () => { if (voile) voile.classList.remove('entre'); });

  /* ---------- en-tête et menu ---------- */
  const entete = $('.entete');
  const burger = $('.burger');
  const menu = $('#menu-mobile');
  function fermerMenu() {
    if (!menu || !menu.classList.contains('ouvert')) return;
    menu.classList.remove('ouvert');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    if (lenis) lenis.start();
    majBarre();
  }
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const ouvert = !menu.classList.contains('ouvert');
      menu.classList.toggle('ouvert', ouvert);
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
      if (lenis) ouvert ? lenis.stop() : lenis.start();
      majBarre();
      if (ouvert) setTimeout(() => { const l = $('a', menu); if (l) l.focus(); }, 200);
    });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) fermerMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerMenu(); });
  }
  /* l’en-tête reste toujours visible : le bouton Mode calme doit rester accessible en un geste */

  /* place occupée par l’en-tête et la barre du bas, mesurée (sections épinglées, dernier bloc) */
  const barre = $('.barre-mobile');
  function mesurerBarres() {
    if (entete) html.style.setProperty('--entete-zone', `${Math.ceil((parseFloat(getComputedStyle(entete).top) || 0) + entete.offsetHeight)}px`);
    const bh = barre && getComputedStyle(barre).display !== 'none' ? Math.ceil(barre.offsetHeight + (parseFloat(getComputedStyle(barre).bottom) || 0)) : 0;
    html.style.setProperty('--barres-h', `${bh}px`);
  }
  mesurerBarres();
  window.addEventListener('resize', mesurerBarres);
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(mesurerBarres); if (entete) ro.observe(entete); if (barre) ro.observe(barre); }

  /* barre du bas : absente du héros, des formulaires, du pied de page et du menu ouvert */
  const zonesBarre = new Map();
  function majBarre() {
    if (!barre) return;
    const masquee = [...zonesBarre.values()].some(Boolean) || (menu && menu.classList.contains('ouvert'));
    barre.classList.toggle('visible', !masquee);
  }
  if (barre && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { es.forEach((e) => zonesBarre.set(e.target, e.isIntersecting)); majBarre(); });
    $$('.ouv, #contact, main form, .pied').forEach((z) => { zonesBarre.set(z, true); io.observe(z); });
  } else if (barre) barre.classList.add('visible');


  /* ---------- curseur, boutons magnétiques, cartes inclinées ---------- */
  const curseur = $('.curseur');
  let px = innerWidth / 2, py = innerHeight / 2;
  T.pointeur = { x: px, y: py, actif: false };
  window.addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; T.pointeur.x = px; T.pointeur.y = py; T.pointeur.actif = true; }, { passive: true });
  if (curseur && !tactile && hasGsap) {
    const qx = gsap.quickTo(curseur, 'x', { duration: 0.35, ease: 'power3.out' });
    const qy = gsap.quickTo(curseur, 'y', { duration: 0.35, ease: 'power3.out' });
    window.addEventListener('pointermove', (e) => { if (!estCalme()) { qx(e.clientX); qy(e.clientY); } }, { passive: true });
    document.addEventListener('pointerover', (e) => { if (e.target.closest('a, button, [data-tilt], label.option, input, textarea')) curseur.classList.add('survol'); });
    document.addEventListener('pointerout', (e) => { if (e.target.closest('a, button, [data-tilt], label.option, input, textarea')) curseur.classList.remove('survol'); });
  }
  function interactions() {
    if (tactile || !hasGsap) return;
    $$('.magnet').forEach((el) => {
      if (el.dataset.lie) return; el.dataset.lie = '1';
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, .45)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, .45)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`);
        if (estCalme()) return;
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28); yTo((e.clientY - (r.top + r.height / 2)) * 0.36);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
    $$('[data-tilt]').forEach((el) => {
      if (el.dataset.lie) return; el.dataset.lie = '1';
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        el.style.setProperty('--rx', `${nx * 100}%`); el.style.setProperty('--ry', `${ny * 100}%`);
        if (estCalme()) return;
        gsap.to(el, { rotateY: (nx - 0.5) * 9, rotateX: (0.5 - ny) * 7, transformPerspective: 900, duration: 0.6, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'power3.out' }));
    });
  }

  /* ---------- ouverture orchestrée (moins de 3 s) ---------- */
  const ouverture = $('.ouverture');
  function jouerOuverture() {
    const deja = ssGet('tcv-vu') === '1';
    ssSet('tcv-vu', '1');
    const els = $$('[data-ouv-el]'), portrait = $('[data-ouv-portrait]'), fond = $('[data-ouv-fond]');
    const titre = $('.ouv [data-split]');
    if (!hasGsap || estCalme()) { if (ouverture) ouverture.remove(); return; }
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (ouverture && !deja) {
      const trait = $('.trait', ouverture), point = $('.point', ouverture), mot = $('.mot', ouverture);
      const L = trait.getTotalLength();
      gsap.set(trait, { strokeDasharray: L, strokeDashoffset: L });
      gsap.set(mot, { opacity: 0, y: 14 });
      const o = { p: 0 };
      tl.to(o, { p: 1, duration: 1.05, ease: 'power2.inOut', onUpdate: () => { const pt = trait.getPointAtLength(o.p * L); point.setAttribute('cx', pt.x); point.setAttribute('cy', pt.y); trait.style.strokeDashoffset = L * (1 - o.p); } })
        .to(mot, { opacity: 1, y: 0, duration: 0.6 }, 0.35)
        .to(ouverture, { clipPath: 'inset(0 0 100% 0)', duration: 0.75, ease: 'power3.inOut' }, 1.25)
        .add(() => ouverture.remove());
    } else if (ouverture) {
      tl.to(ouverture, { opacity: 0, duration: 0.35 }).add(() => ouverture.remove());
    }
    const debut = ouverture && !deja ? 1.35 : 0.15;
    if (fond) tl.fromTo(fond, { scale: 1.14 }, { scale: 1, duration: 2.2, ease: 'power2.out' }, debut - 0.3);
    if (titre) {
      const st = new SplitText(titre, { type: 'lines', mask: 'lines', linesClass: 'ligne-split' });
      tl.from(st.lines, { yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out' }, debut);
      T.splits.push(st);
    }
    if (els.length) tl.from(els, { y: 26, opacity: 0, duration: 0.9, stagger: 0.08 }, debut + 0.15);
    if (portrait) tl.from(portrait, { clipPath: 'inset(100% 0 0 0 round 999px 999px 32px 32px)', y: 40, duration: 1.3, ease: 'expo.out' }, debut + 0.05);
  }
  T.splits = [];

  /* ---------- fil d’or du chemin de vie ---------- */
  const main = $('main');
  let fil = null;
  function construireFil() {
    if (!main) return;
    const depart = $('[data-fil-depart]');
    /* chaque section après l’ouverture sert de point d’appui, alternativement à gauche et à droite */
    const ancres = $$('main > section, main > .pin-spacer > section').filter((s) => !s.classList.contains('ouv'));
    if (!depart || ancres.length < 2) return;
    if (!fil) {
      fil = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      fil.setAttribute('class', 'fil'); fil.setAttribute('aria-hidden', 'true');
      fil.innerHTML = '<defs><linearGradient id="degradeFil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9CB85"/><stop offset=".5" stop-color="#C99A3B"/><stop offset="1" stop-color="#E9CB85"/></linearGradient></defs><path class="fil__ombre"/><path class="fil__or"/><circle class="luciole" r="4.5"/>';
      main.appendChild(fil);
    }
    const mr = main.getBoundingClientRect();
    const top0 = mr.top + window.scrollY;
    const W = main.clientWidth;
    const H = main.scrollHeight;
    fil.setAttribute('viewBox', `0 0 ${W} ${H}`);
    fil.style.height = `${H}px`;
    const marge = W < 720 ? 8 : clamp(W * 0.022, 16, 34);
    const dr = depart.getBoundingClientRect();
    const pts = [[dr.left + dr.width / 2 - mr.left, dr.top + window.scrollY - top0]];
    ancres.forEach((s, i) => {
      const r = (s.parentElement.classList.contains('pin-spacer') ? s.parentElement : s).getBoundingClientRect();
      const cs = getComputedStyle(s);
      const pt = parseFloat(cs.paddingTop) || 60, pb = parseFloat(cs.paddingBottom) || 60;
      const y = r.top + window.scrollY - top0;
      const x = i % 2 === 0 ? marge : W - marge;
      pts.push([x, y + Math.min(pt * 0.75, r.height * 0.2)]);
      pts.push([x, y + r.height - Math.min(pb * 0.75, r.height * 0.2)]);
    });
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const dy = (y1 - y0) * 0.5;
      d += ` C${x0.toFixed(1)},${(y0 + dy).toFixed(1)} ${x1.toFixed(1)},${(y1 - dy).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    const [ombre, or] = $$('path', fil);
    ombre.setAttribute('d', d); or.setAttribute('d', d);
    const L = or.getTotalLength();
    or.style.strokeDasharray = `${L}`;
    /* table longueur ↔ hauteur pour suivre le regard du visiteur */
    const pas = Math.max(16, L / 900);
    const table = [];
    for (let l = 0; l <= L; l += pas) { const p = or.getPointAtLength(l); table.push([l, p.y, p.x]); }
    fil._L = L; fil._table = table; fil._top0 = top0; fil._or = or; fil._luciole = $('.luciole', fil);
    majFil();
  }
  function majFil() {
    if (!fil || !fil._table) return;
    const cible = window.scrollY + innerHeight * 0.62 - fil._top0;
    const t = fil._table;
    /* le chemin descend toujours : recherche dichotomique de la hauteur visée */
    let lo = 0, hi = t.length - 1;
    while (lo < hi) { const mi = (lo + hi + 1) >> 1; if (t[mi][1] <= cible) lo = mi; else hi = mi - 1; }
    const idx = lo;
    const l = t[idx][0];
    if (estCalme()) { fil._or.style.strokeDashoffset = '0'; return; }
    fil._or.style.strokeDashoffset = `${fil._L - l}`;
    fil._luciole.setAttribute('cx', t[idx][2]); fil._luciole.setAttribute('cy', t[idx][1]);
    fil._luciole.style.opacity = l > 2 && l < fil._L - 2 ? 1 : 0;
  }
  window.addEventListener('scroll', majFil, { passive: true });

  /* ---------- animations au défilement (annulables d’un coup) ---------- */
  let ctx = null;
  function construireAnimations() {
    if (!hasGsap || estCalme()) return;
    ctx = gsap.context(() => {
      $$('[data-split]').forEach((el) => {
        if (el.closest('.ouv')) return;
        const st = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'ligne-split' });
        gsap.from(st.lines, { yPercent: 105, duration: 1.1, stagger: 0.09, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
      });
      ScrollTrigger.batch('[data-revele]', {
        start: 'top 90%', once: true,
        onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'power3.out', overwrite: true })
      });
      $$('[data-revele-image]').forEach((el) => {
        const im = $('img', el);
        gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
        if (im) gsap.fromTo(im, { scale: 1.22 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
      });
      $$('[data-parallaxe]').forEach((el) => {
        gsap.fromTo(el, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      $$('[data-parallaxe-int]').forEach((el) => {
        gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      $$('.ouv [data-ouv-fond]').forEach((el) => {
        gsap.to(el, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: el.closest('.ouv'), start: 'top top', end: 'bottom top', scrub: true } });
      });
      $$('[data-compteur]').forEach((el) => {
        const n = +el.dataset.compteur; const o = { v: 0 };
        gsap.to(o, { v: n, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' }, onUpdate: () => { el.textContent = Math.round(o.v); } });
      });
      $$('[data-arbre]').forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)', scale: 0.55, rotate: -4 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, rotate: 0, duration: 2.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
        gsap.to(el, { rotate: 1.6, duration: 5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2.2 });
      });
      $$('[data-flotte]').forEach((el) => gsap.to(el, { y: -10, rotate: 12, duration: 4.5, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      $$('[data-parcours], [data-deroule]').forEach((el) => {
        gsap.fromTo(el, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: 0.6 } });
      });
      $$('[data-trace]').forEach((p) => {
        const L = p.getTotalLength ? p.getTotalLength() : 0;
        if (!L) return;
        gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', scrollTrigger: { trigger: p.closest('svg'), start: 'top 85%' } });
      });
      $$('[data-galet]').forEach((g, i) => gsap.from(g, { scale: 0, transformOrigin: '50% 50%', svgOrigin: undefined, duration: 0.8, delay: 0.3 + (i % 5) * 0.25, ease: 'back.out(2)', scrollTrigger: { trigger: g.closest('svg'), start: 'top 85%' } }));
      $$('[data-cartes] .carte-chemin').forEach((c, i) => gsap.from(c, { y: 90, opacity: 0, duration: 1.3, delay: (i % 4) * 0.1, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 95%' } }));
      $$('[data-puces] span').forEach((s, i) => gsap.from(s, { y: 18, opacity: 0, duration: 0.6, delay: i * 0.04, ease: 'power3.out', scrollTrigger: { trigger: s.parentElement, start: 'top 85%' } }));
      $$('[data-mots]').forEach((q) => {
        if (!q.dataset.decoupe) {
          q.innerHTML = q.textContent.trim().split(/(\s+)/).map((w) => (/\s+/.test(w) ? w : `<span class="mot">${w}</span>`)).join('');
          q.dataset.decoupe = '1';
        }
        const mots = $$('.mot', q);
        ScrollTrigger.create({ trigger: q, start: 'top 80%', end: 'bottom 45%', scrub: true, onUpdate: (s) => { const n = Math.round(s.progress * mots.length); mots.forEach((m, i) => m.classList.toggle('vu', i < n)); } });
      });
      $$('[data-plan]').forEach((pl) => gsap.from(pl, { scale: 0.94, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: pl, start: 'top 88%' } }));
      if (window.TCVpages && window.TCVpages.animations) window.TCVpages.animations();
    });
  }
  function arreterAnimations() {
    if (window.TCVpages && window.TCVpages.revert) window.TCVpages.revert();
    if (ctx) { ctx.revert(); ctx = null; }
    $$('[data-mots] .mot').forEach((m) => m.classList.add('vu'));
    arreterLenis();
    if (hasGsap) { gsap.set('[data-revele]', { clearProps: 'all' }); ScrollTrigger.refresh(); }
    majFil();
  }
  function demarrerAnimations() {
    demarrerLenis();
    construireAnimations();
    interactions();
    if (hasGsap) ScrollTrigger.refresh();
    construireFil();
  }
  T.ctx = () => ctx;

  /* ---------- pendule de radiesthésie ---------- */
  function pendules() {
    $$('[data-pendule]').forEach((svg) => {
      const bras = $('.pendule__bras', svg);
      if (!bras) return;
      let a = 0, v = 0, visible = false, t0 = performance.now();
      new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) requestAnimationFrame(boucle); }, { rootMargin: '80px' }).observe(svg);
      function boucle(t) {
        if (!visible) return;
        if (estCalme()) { bras.style.transform = 'rotate(0deg)'; requestAnimationFrame(boucle); return; }
        const vit = clamp((lenis ? lenis.velocity : 0) * 0.9, -26, 26);
        const balancement = Math.sin((t - t0) / 900) * 4;
        const cible = vit + balancement;
        v += (cible - a) * 0.018; v *= 0.94; a += v;
        bras.style.transform = `rotate(${a.toFixed(2)}deg)`;
        requestAnimationFrame(boucle);
      }
    });
  }

  /* ---------- voile de poussière qui se nettoie ---------- */
  function nettoyages() {
    $$('[data-nettoyage]').forEach((bloc) => {
      const cv = $('canvas', bloc); if (!cv) return;
      const mode = bloc.dataset.nettoyage;
      const c = cv.getContext('2d');
      const voileC = document.createElement('canvas'), vc = voileC.getContext('2d');
      const maskC = document.createElement('canvas'), mc = maskC.getContext('2d');
      let W = 0, H = 0, p = 0, dpr = 1, visible = false, sale = true;
      function taille() {
        const r = bloc.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 1.5);
        W = Math.max(2, Math.round(r.width * dpr)); H = Math.max(2, Math.round(r.height * dpr));
        [cv, voileC, maskC].forEach((k) => { k.width = W; k.height = H; });
        /* voile : brume ivoire, poussières, traînées */
        const g = vc.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, 'rgba(236,226,208,.94)'); g.addColorStop(1, 'rgba(214,201,182,.94)');
        vc.fillStyle = g; vc.fillRect(0, 0, W, H);
        let s = 7;
        const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
        for (let i = 0; i < 2600; i++) { vc.fillStyle = `rgba(${rnd() < 0.5 ? '120,105,90' : '255,250,240'},${0.08 + rnd() * 0.25})`; const r0 = rnd() * 2.4 * dpr; vc.fillRect(rnd() * W, rnd() * H, r0, r0); }
        for (let i = 0; i < 40; i++) { vc.fillStyle = `rgba(150,130,110,${0.04 + rnd() * 0.06})`; vc.beginPath(); vc.ellipse(rnd() * W, rnd() * H, (40 + rnd() * 160) * dpr, (10 + rnd() * 40) * dpr, rnd() * 3, 0, 6.3); vc.fill(); }
        vc.fillStyle = 'rgba(26,33,64,.55)'; vc.font = `${600} ${13 * dpr}px Manrope, sans-serif`;
        mc.clearRect(0, 0, W, H);
        sale = true; dessiner();
      }
      /* trajectoire du nettoyage : pièce par pièce (zigzag) ou coups de pinceau horizontaux */
      const passes = mode === 'pinceau' ? 6 : 5;
      function point(t) {
        const k = t * passes, i = Math.floor(k), f = k - i;
        const y = (i + 0.5) / passes;
        const x = i % 2 === 0 ? f : 1 - f;
        return [(-0.08 + x * 1.16) * W, (y + Math.sin(f * Math.PI * 2) * 0.03) * H];
      }
      function dessiner() {
        c.globalCompositeOperation = 'source-over';
        c.clearRect(0, 0, W, H);
        c.drawImage(voileC, 0, 0);
        c.globalCompositeOperation = 'destination-out';
        const larg = (H / passes) * (mode === 'pinceau' ? 1.5 : 1.7);
        c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = larg;
        c.shadowColor = 'rgba(0,0,0,1)'; c.shadowBlur = larg * 0.45;
        c.strokeStyle = 'rgba(0,0,0,1)';
        if (p > 0.001) {
          c.beginPath();
          const n = Math.ceil(p * 260);
          for (let i = 0; i <= n; i++) { const [x, y] = point((i / 260)); i ? c.lineTo(x, y) : c.moveTo(x, y); }
          c.stroke();
        }
        c.shadowBlur = 0;
        c.drawImage(maskC, 0, 0);
        c.globalCompositeOperation = 'source-over';
        if (p > 0.001 && p < 0.999) {
          const [x, y] = point(p);
          const gr = c.createRadialGradient(x, y, 0, x, y, larg * 0.7);
          gr.addColorStop(0, 'rgba(255,240,200,.55)'); gr.addColorStop(1, 'rgba(255,240,200,0)');
          c.fillStyle = gr; c.fillRect(x - larg, y - larg, larg * 2, larg * 2);
        }
        sale = false;
      }
      bloc.addEventListener('pointermove', (e) => {
        if (estCalme()) return;
        const r = cv.getBoundingClientRect();
        const x = (e.clientX - r.left) * dpr, y = (e.clientY - r.top) * dpr;
        const g = mc.createRadialGradient(x, y, 0, x, y, 70 * dpr);
        g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        mc.fillStyle = g; mc.beginPath(); mc.arc(x, y, 70 * dpr, 0, 6.3); mc.fill();
        sale = true;
      });
      new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) requestAnimationFrame(boucle); }, { rootMargin: '100px' }).observe(bloc);
      function boucle() {
        if (!visible) return;
        if (!estCalme()) {
          const r = bloc.getBoundingClientRect();
          const cible = clamp((innerHeight * 0.92 - r.top) / (innerHeight * 0.92 - innerHeight * 0.12 + r.height * 0.5), 0, 1);
          const np = p + (cible - p) * 0.08;
          if (Math.abs(np - p) > 0.0004) { p = np; sale = true; }
          if (sale) dessiner();
        }
        requestAnimationFrame(boucle);
      }
      taille();
      let to; window.addEventListener('resize', () => { clearTimeout(to); to = setTimeout(taille, 200); });
    });
  }

  /* ---------- prochaine Journée et compte à rebours ---------- */
  function prochaine() {
    const blocs = $$('[data-prochaine]');
    const mini = $('[data-prochaine-mini]');
    const { avenir } = T.journees();
    const j = avenir.find((x) => x.date);
    if (mini && j) mini.innerHTML = `Prochaine Journée : <strong>${T.dateCourte(j.date).semaine.slice(0, 3)}. ${T.dateCourte(j.date).jour === '1' ? '1er' : T.dateCourte(j.date).jour} ${T.dateCourte(j.date).moisLong}</strong>`;
    if (!blocs.length) return;
    blocs.forEach((b) => {
      if (!j) { $('[data-prochaine-titre]', b).textContent = 'De nouvelles dates arrivent'; const c = $('[data-compte]', b); if (c) c.remove(); return; }
      $('[data-prochaine-titre]', b).textContent = j.titre;
      $('[data-prochaine-sous]', b).textContent = j.sousTitre;
      $('[data-prochaine-date]', b).textContent = `${T.dateLongue(j.date)} · 9h30 à 17h30 · Espace Ressources des 3 Tilleuls, Watermael-Boitsfort · 120 € (90 € réduit)`;
      const dc = T.dateCourte(j.date);
      const badge = $('[data-prochaine-badge]', b);
      if (badge) { $('b', badge).textContent = dc.jour; $('span', badge).textContent = dc.mois; }
      const im = $('[data-prochaine-image]', b);
      if (im) im.classList.toggle('cadre--galet', !j.toile);
      if (im) im.innerHTML = T.img(j.image, j.toile ? `Toile de la Journée ${j.titre}` : `Illustration provisoire de la Journée ${j.titre}`, '(max-width: 860px) 80vw, 460px') + (j.provisoire ? '<span class="provisoire-tag">Image provisoire du site actuel</span>' : '');
      const btn = $('[data-journee-prochaine]', b); if (btn) btn.dataset.journee = j.id;
      const det = $('[data-detail-prochaine]', b); if (det) det.dataset.journeeDetail = j.id;
      const cpt = $('[data-compte]', b);
      if (cpt) {
        const cible = new Date(j.date).getTime();
        const els = { j: $('[data-j]', cpt), h: $('[data-h]', cpt), m: $('[data-m]', cpt), s: $('[data-s]', cpt) };
        const maj = () => {
          let r = Math.max(0, cible - Date.now()) / 1000;
          const jj = Math.floor(r / 86400); r -= jj * 86400;
          const hh = Math.floor(r / 3600); r -= hh * 3600;
          const mm = Math.floor(r / 60); const ss = Math.floor(r - mm * 60);
          els.j.textContent = jj; els.h.textContent = String(hh).padStart(2, '0'); els.m.textContent = String(mm).padStart(2, '0'); els.s.textContent = String(ss).padStart(2, '0');
          cpt.setAttribute('aria-label', `Encore ${jj} jours, ${hh} heures et ${mm} minutes avant la Journée`);
        };
        maj(); setInterval(maj, 1000);
      }
    });
  }

  /* ---------- articles du blog ---------- */
  function articles() {
    $$('[data-articles]').forEach((z) => {
      let liste = D.blog.slice(0, 3);
      if (z.dataset.articles === 'soins') liste = [D.blog[1], D.blog[5], D.blog[4]];
      z.innerHTML = liste.map((a) => {
        const d = new Date(a.date + 'T12:00:00+02:00');
        return `<a class="article" href="${a.url}" rel="noopener" target="_blank" data-revele>
          <div class="cadre zoom">${T.img(a.image, '', '(max-width: 860px) 120px, 30vw')}</div>
          <div><time datetime="${a.date}">${d.getDate()} ${moisFr[d.getMonth()]} ${d.getFullYear()} · ${a.lecture} min</time><h3>${a.titre}</h3></div></a>`;
      }).join('');
    });
  }

  /* ---------- avis défilants ---------- */
  function defilants() {
    $$('[data-defilant]').forEach((z) => {
      const rangs = $$('.defilant__rang', z);
      const av = D.avisJournees;
      const moitie = Math.ceil(av.length / 2);
      rangs.forEach((r, i) => {
        const items = (i ? av.slice(moitie) : av.slice(0, moitie));
        const bloc = items.map((t) => `<p class="bulle">« ${t} »</p>`).join('');
        r.innerHTML = bloc + bloc.replace(/<p class="bulle">/g, '<p class="bulle" aria-hidden="true">') + bloc.replace(/<p class="bulle">/g, '<p class="bulle" aria-hidden="true">');
        let x = 0, visible = false; const sens = +r.dataset.sens || 1;
        new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) requestAnimationFrame(boucle); }).observe(r);
        function boucle() {
          if (!visible) return;
          if (!estCalme()) {
            const w = r.scrollWidth / 3;
            x -= (0.35 + Math.abs(T.vitesse()) * 0.12) * sens;
            if (x < -w) x += w; if (x > 0) x -= w;
            r.style.transform = `translate3d(${x}px,0,0)`;
          } else r.style.transform = '';
          requestAnimationFrame(boucle);
        }
      });
    });
  }

  /* ---------- ambiance sonore générée (seulement après un clic) ---------- */
  const son = { ctx: null, maitre: null, actif: false, minuteur: null };
  function creerSon() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    const ac = new AC();
    const maitre = ac.createGain(); maitre.gain.value = 0;
    const filtre = ac.createBiquadFilter(); filtre.type = 'lowpass'; filtre.frequency.value = 900;
    const delai = ac.createDelay(1.5); delai.delayTime.value = 0.42;
    const retour = ac.createGain(); retour.gain.value = 0.38;
    delai.connect(retour); retour.connect(delai);
    filtre.connect(maitre); delai.connect(maitre); maitre.connect(ac.destination);
    [[110, 'sine', 0.5], [164.81, 'triangle', 0.16], [220, 'sine', 0.22], [277.18, 'sine', 0.06]].forEach(([f, type, g], i) => {
      const o = ac.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = (i - 1.5) * 4;
      const gg = ac.createGain(); gg.gain.value = g;
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.05 + i * 0.03;
      const lg = ac.createGain(); lg.gain.value = g * 0.5; lfo.connect(lg); lg.connect(gg.gain);
      o.connect(gg); gg.connect(filtre); o.start(); lfo.start();
    });
    son.ctx = ac; son.maitre = maitre; son.delai = delai;
    return true;
  }
  function carillon() {
    if (!son.actif) return;
    const ac = son.ctx;
    const notes = [440, 523.25, 587.33, 659.25, 783.99, 880];
    const f = notes[Math.floor(Math.random() * notes.length)];
    const t = ac.currentTime;
    [1, 2.01].forEach((h, i) => {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f * h;
      const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(i ? 0.018 : 0.06, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + (i ? 1.6 : 4));
      o.connect(g); g.connect(son.maitre); g.connect(son.delai); o.start(t); o.stop(t + 4.2);
    });
    son.minuteur = setTimeout(carillon, 4200 + Math.random() * 6000);
  }
  $$('[data-son]').forEach((b) => b.addEventListener('click', () => {
    if (!son.ctx && !creerSon()) return;
    son.actif = !son.actif;
    const ac = son.ctx; const t = ac.currentTime;
    $$('[data-son]').forEach((x) => x.setAttribute('aria-pressed', son.actif ? 'true' : 'false'));
    if (son.actif) {
      ac.resume(); son.maitre.gain.cancelScheduledValues(t); son.maitre.gain.setValueAtTime(son.maitre.gain.value, t); son.maitre.gain.linearRampToValueAtTime(0.32, t + 2.5);
      clearTimeout(son.minuteur); son.minuteur = setTimeout(carillon, 1800);
    } else {
      son.maitre.gain.cancelScheduledValues(t); son.maitre.gain.setValueAtTime(son.maitre.gain.value, t); son.maitre.gain.linearRampToValueAtTime(0, t + 1.2);
      clearTimeout(son.minuteur); setTimeout(() => { if (!son.actif) ac.suspend(); }, 1300);
    }
  }));
  document.addEventListener('visibilitychange', () => { if (son.ctx && son.actif) document.hidden ? son.ctx.suspend() : son.ctx.resume(); });

  /* ---------- prise de rendez-vous (simulée) ---------- */
  const rdv = $('#rdv');
  function rdvInit() {
    if (!rdv) return;
    const form = $('form', rdv);
    let pas = 1;
    const listeJ = $('[data-liste-journees]', rdv);
    const { avenir } = T.journees();
    if (listeJ) listeJ.innerHTML = avenir.filter((j) => j.date).map((j, i) => `<label class="option"><input type="radio" name="journee" value="${j.id}"${i === 0 ? ' checked' : ''}><b>${j.titre}</b><small>${T.dateLongue(j.date)}</small></label>`).join('');
    const montrer = (n) => {
      pas = n;
      $$('.rdv__pas', rdv).forEach((s) => s.classList.toggle('actif', +s.dataset.pas === n));
      $$('.rdv__etapes i', rdv).forEach((i, k) => i.classList.toggle('fait', k < n));
      const type = form.type.value;
      if (n === 2) {
        ['soin', 'lieu', 'journee', 'formation'].forEach((b) => { const el = $(`[data-bloc="${b}"]`, rdv); el.hidden = !((b === 'soin' && (type === 'premier' || type === 'suivant')) || b === type); });
        $('[data-titre-pas2]', rdv).textContent = { premier: 'Vos préférences', suivant: 'Vos préférences', lieu: 'Quel lieu ?', journee: 'Quelle Journée ?', formation: 'Quel module ?' }[type];
      }
      if (n === 4) recap();
      const cible = $('.rdv__pas.actif input, .rdv__pas.actif button.btn', rdv); if (cible) setTimeout(() => cible.focus(), 60);
    };
    const val = (n) => { const el = form.elements[n]; if (!el) return ''; if (el instanceof RadioNodeList) return el.value; return el.value || ''; };
    function recap() {
      const type = val('type');
      const lignes = [];
      const lib = { premier: 'Premier soin énergétique (1h45, 100 €)', suivant: 'Séance de suivi (1h30, 85 €)', lieu: 'Nettoyage énergétique d’un lieu', journee: 'Inscription à une Journée bien-être', formation: 'Inscription à une formation' }[type];
      lignes.push(['Demande', lib]);
      if (type === 'premier' || type === 'suivant') {
        const jours = $$('input[name="jour"]:checked', rdv).map((i) => i.value.toLowerCase());
        lignes.push(['Préférences', `${jours.length ? jours.join(', ') : 'jour indifférent'}, ${val('moment').toLowerCase()}`]);
      }
      if (type === 'lieu') { lignes.push(['Lieu', val('lieu') === 'pro' ? 'Environnement professionnel' : 'Lieu de vie']); if (val('commune')) lignes.push(['Commune', val('commune')]); }
      if (type === 'journee') { const j = D.journees.find((x) => x.id === val('journee')); if (j) lignes.push(['Journée', `${j.titre}, ${T.dateLongue(j.date)}`]); lignes.push(['Tarif', val('tarif') === 'reduit' ? '90 € (tarif réduit)' : '120 €']); }
      if (type === 'formation') { const m = D.formations[+val('module') - 1]; const duo = form.duo.checked; lignes.push(['Module', `${m.n} · ${m.titre}`]); lignes.push(['Prix', duo ? `${m.prix - 20} € chacun(e), en duo` : `${m.prix} €`]); }
      lignes.push(['Prénom', val('prenom')]); lignes.push(['Téléphone', val('tel')]);
      $('[data-recap]', rdv).innerHTML = lignes.map(([a, b]) => `<dt>${a}</dt><dd>${b.replace(/</g, '&lt;')}</dd>`).join('');
      let msg = `Bonjour Joëlle, je suis ${val('prenom')}.\n`;
      if (type === 'premier' || type === 'suivant') msg += `Je souhaiterais un rendez-vous : ${lib.toLowerCase()}.\nMes préférences : ${lignes[1][1]}.\n`;
      if (type === 'lieu') msg += `Je souhaiterais un nettoyage énergétique de mon ${val('lieu') === 'pro' ? 'environnement professionnel' : 'lieu de vie'}${val('commune') ? ` (${val('commune')})` : ''}.\n`;
      if (type === 'journee') { const j = D.journees.find((x) => x.id === val('journee')); msg += `Je souhaiterais m’inscrire à la Journée « ${j ? j.titre : ''} » du ${j ? T.dateLongue(j.date) : ''} (${val('tarif') === 'reduit' ? 'tarif réduit' : 'tarif plein'}).\n`; }
      if (type === 'formation') msg += `Je souhaiterais m’inscrire au module ${val('module')} de la formation${form.duo.checked ? ', en duo' : ''}.\n`;
      if (val('message').trim()) msg += `\n${val('message').trim()}\n`;
      msg += `\nMon numéro : ${val('tel')}. Merci !`;
      $('[data-message]', rdv).textContent = msg;
      $('[data-wa]', rdv).href = `https://wa.me/${D.contact.whatsapp}?text=${encodeURIComponent(msg)}`;
    }
    rdv.addEventListener('click', (e) => {
      if (e.target === rdv) { rdv.close(); return; }
      if (e.target.closest('[data-fermer]')) { rdv.close(); return; }
      if (e.target.closest('[data-suivant]')) {
        if (pas === 3) {
          const err = $('[data-erreur]', rdv);
          if (!val('prenom').trim()) { err.textContent = 'Indiquez votre prénom.'; form.prenom.focus(); return; }
          if (val('tel').replace(/\D/g, '').length < 8) { err.textContent = 'Indiquez un numéro de téléphone valide.'; form.tel.focus(); return; }
          err.textContent = '';
        }
        montrer(Math.min(4, pas + 1));
      }
      if (e.target.closest('[data-precedent]')) montrer(Math.max(1, pas - 1));
    });
    rdv.addEventListener('close', () => { if (lenis) lenis.start(); });
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-rdv]');
      if (!b) return;
      e.preventDefault();
      fermerMenu();
      const type = b.dataset.rdv || 'premier';
      const r = $(`input[name="type"][value="${type}"]`, rdv); if (r) r.checked = true;
      if (b.dataset.journee) { const rj = $(`input[name="journee"][value="${b.dataset.journee}"]`, rdv); if (rj) rj.checked = true; }
      if (typeof rdv.showModal === 'function') { rdv.showModal(); } else rdv.setAttribute('open', '');
      if (lenis) lenis.stop();
      montrer(type === 'premier' ? 1 : 2);
    });
  }

  /* formulaire de contact simulé */
  $$('[data-contact]').forEach((f) => f.addEventListener('submit', (e) => { e.preventDefault(); const m = $('[data-merci]', f); m.classList.add('visible'); m.focus && m.setAttribute('tabindex', '-1'); m.focus(); }));

  /* ---------- démarrage ---------- */
  function demarrer() {
    if (hasGsap) gsap.registerPlugin(ScrollTrigger, SplitText);
    prochaine();
    articles();
    defilants();
    rdvInit();
    if (window.TCVpages && window.TCVpages.init) window.TCVpages.init();
    demarrerLenis();
    jouerOuverture();
    construireAnimations();
    interactions();
    pendules();
    nettoyages();
    construireFil();
    if (hasGsap) {
      ScrollTrigger.addEventListener('refresh', () => requestAnimationFrame(construireFil));
      window.addEventListener('load', () => ScrollTrigger.refresh());
      document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
    } else {
      window.addEventListener('resize', construireFil);
    }
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(construireFil, 250); });
    /* si le visiteur arrive sur une ancre */
    if (location.hash) { const c = document.getElementById(location.hash.slice(1)); if (c) setTimeout(() => { lenis ? lenis.scrollTo(c, { offset: -90, immediate: true }) : c.scrollIntoView(); }, 300); }
  }
  /* attendre que toutes les briques (pages.js, lumiere.js) soient chargées */
  if (document.readyState === 'complete') demarrer(); else document.addEventListener('DOMContentLoaded', demarrer);
})();
