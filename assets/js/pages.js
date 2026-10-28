/* Animations et fonctionnalités propres à chaque page */
(() => {
  'use strict';
  const page = document.body.dataset.page;
  const D = window.TCV;
  const S = () => window.TCVsite;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Journées : le chemin en pierres de gué ---------- */
  function agenda() {
    const piste = $('[data-gue-piste]');
    if (!piste) return;
    const T = S();
    const { avenir, passees } = T.journees();
    const nb = { avenir: avenir.length, passees: passees.length };
    $$('[data-nb]').forEach((s) => { s.textContent = `(${nb[s.dataset.nb]})`; });
    const carte = (j, statut, i) => {
      const date = j.date ? T.dateCourte(j.date) : null;
      const lib = statut === 'passee' ? 'Déjà parcourue' : (i === 0 ? 'Prochaine' : (j.speciale ? 'Journée spéciale' : 'À venir'));
      return `<button class="pierre ${statut === 'passee' ? 'passee' : ''} ${statut !== 'passee' && i === 0 ? 'prochaine-pierre' : ''}" type="button" data-journee-detail="${j.id}">
        <div class="cadre ${j.toile ? 'cadre--toile' : 'cadre--galet'}">${T.img(j.image, '', '(max-width: 620px) 78vw, 330px')}<span class="etiquette-statut">${lib}</span></div>
        <span class="pierre__date">${date ? `${date.semaine} ${date.jour === '1' ? '1er' : date.jour} ${date.moisLong} ${date.annee}` : `Organisée en ${j.mois}`}</span>
        <h3>${j.titre}</h3><p>${j.sousTitre}</p></button>`;
    };
    const rendre = (filtre) => {
      const liste = filtre === 'passees' ? passees : avenir;
      piste.innerHTML = liste.map((j, i) => carte(j, filtre === 'passees' ? 'passee' : 'avenir', i)).join('') || '<p>De nouvelles dates arrivent bientôt.</p>';
      piste.scrollLeft = 0;
      if (window.gsap && !T.estCalme()) gsap.from($$('.pierre', piste), { y: 50, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'expo.out' });
    };
    rendre('avenir');
    $$('[data-filtre]').forEach((b) => b.addEventListener('click', () => {
      $$('[data-filtre]').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      rendre(b.dataset.filtre);
    }));
    $$('[data-gue]').forEach((b) => b.addEventListener('click', () => {
      const w = ($('.pierre', piste) || { offsetWidth: 300 }).offsetWidth + 24;
      piste.scrollBy({ left: w * +b.dataset.gue, behavior: T.estCalme() ? 'auto' : 'smooth' });
    }));
    /* la molette verticale ne doit pas être captée par la piste horizontale */
    piste.addEventListener('wheel', (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation(); }, { passive: true });
  }

  /* ---------- tiroir d’une Journée ---------- */
  function tiroir() {
    const dlg = $('#tiroir');
    if (!dlg) return;
    const T = S();
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-journee-detail]');
      if (!b) return;
      const j = D.journees.find((x) => x.id === b.dataset.journeeDetail);
      if (!j) return;
      const { avenir } = T.journees();
      const aVenir = avenir.includes(j);
      $('[data-tiroir-image]', dlg).innerHTML = T.img(j.image, j.toile ? `Toile de la Journée ${j.titre}` : `Image provisoire de la Journée ${j.titre}`, '560px') + (j.provisoire ? '<span class="provisoire-tag">Image provisoire du site actuel</span>' : '');
      $('[data-tiroir-image]', dlg).classList.toggle('cadre--contain', !!j.toile);
      const J = D.journeeType;
      $('[data-tiroir-corps]', dlg).innerHTML = `
        <p class="eyebrow">${j.speciale ? 'Journée spéciale' : 'Journée bien-être'}${aVenir ? '' : ' · déjà parcourue'}</p>
        <h2 id="tiroir-titre">${j.titre}</h2>
        <p class="chapo" style="font-size:1.05rem">${j.sousTitre}</p>
        <div class="faits">
          <div><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-calendrier"/></svg><span>${j.date ? `${T.dateLongue(j.date)}, ${J.horaire}` : `Organisée en ${j.mois} · prochaine date à venir`}</span></div>
          <div><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-lieu"/></svg><span>${D.salle.nom}, ${D.salle.rue}, ${D.salle.cp} (${D.salle.commune})</span></div>
          <div><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-euro"/></svg><span>${J.prix} € · ${J.prixReduit} € pour les ${J.reduit}. ${J.compris}</span></div>
          <div><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-groupe"/></svg><span>Petit comité : ${J.jauge.min} à ${J.jauge.max} personnes maximum</span></div>
        </div>
        <p>${j.accroche}</p><p>${j.intention}</p>
        <h3>Au programme</h3><p>${j.programme}</p>
        <p style="font-family:var(--serif);font-style:italic;font-size:1.15rem">${j.envoi}</p>
        <div class="btn-groupe" style="margin-top:24px">${aVenir ? `<button class="btn" type="button" data-rdv="journee" data-journee="${j.id}">Je m’inscris à cette Journée</button>` :
          `<a class="btn" href="https://wa.me/${D.contact.whatsapp}?text=${encodeURIComponent(`Bonjour Joëlle, la Journée « ${j.titre} » m’intéresse : pourriez-vous me prévenir quand elle sera à nouveau au programme ? Merci !`)}" rel="noopener" target="_blank">Me prévenir de son retour</a>`}
        <button class="btn btn--ligne" type="button" data-fermer>Fermer</button></div>
        <p class="petit" style="margin-top:16px">Inscription par WhatsApp au ${D.contact.tel}, en mentionnant la date et le thème : Joëlle vous envoie ensuite toutes les modalités pratiques.</p>`;
      dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', '');
      const l = S().lenis(); if (l) l.stop();
      $('.tiroir__defile', dlg).scrollTop = 0;
    });
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || e.target.closest('[data-fermer]')) dlg.close();
      if (e.target.closest('[data-rdv]')) dlg.close();
    });
    dlg.addEventListener('close', () => { const l = S().lenis(); if (l) l.start(); });
  }

  /* ---------- respiration guidée (soins) ---------- */
  function respiration() {
    const z = $('[data-respiration]');
    if (!z || !window.gsap) return;
    const cercle = $('.souffle__cercle', z), texte = $('[data-souffle-texte]', z), btn = $('[data-souffle-btn]', z);
    let tl = null;
    btn.addEventListener('click', () => {
      if (tl) { tl.kill(); tl = null; gsap.to(cercle, { scale: 0.55, duration: 0.8 }); texte.textContent = 'Respirez'; btn.textContent = 'Commencer la pause'; btn.setAttribute('aria-pressed', 'false'); return; }
      btn.textContent = 'Arrêter'; btn.setAttribute('aria-pressed', 'true');
      tl = gsap.timeline({ repeat: 5, onComplete: () => { tl = null; texte.textContent = 'Merci'; btn.textContent = 'Recommencer'; btn.setAttribute('aria-pressed', 'false'); } });
      tl.add(() => { texte.textContent = 'Inspirez'; }).to(cercle, { scale: 1, duration: 4, ease: 'sine.inOut' })
        .add(() => { texte.textContent = 'Expirez'; }).to(cercle, { scale: 0.55, duration: 6, ease: 'sine.inOut' });
    });
  }

  /* ---------- animations propres à chaque page (dans le contexte annulable) ---------- */
  let mm = null;
  function animations() {
    mm = gsap.matchMedia();
    if (page === 'accueil') {
      const scene = $('[data-seance]'), piste = $('[data-piste]');
      mm.add('(min-width: 901px)', () => {
        const barres = $$('.seance__progres i');
        const dist = () => Math.max(0, piste.scrollWidth - (piste.parentElement.clientWidth) + 40);
        const tw = gsap.to(piste, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: {
            trigger: scene.closest('section'), start: 'top top', end: () => `+=${dist() + innerHeight * 0.4}`, pin: true, scrub: 0.8, invalidateOnRefresh: true,
            onUpdate: (s) => barres.forEach((b, i) => gsap.set(b, { scaleX: Math.min(1, Math.max(0, s.progress * 4 - i)) }))
          }
        });
        $$('.etape .cadre img', piste).forEach((im) => gsap.fromTo(im, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: im.closest('.etape'), containerAnimation: tw, start: 'left right', end: 'center center', scrub: true } }));
        $$('.etape__num', piste).forEach((n) => gsap.from(n, { yPercent: 80, opacity: 0, scrollTrigger: { trigger: n.closest('.etape'), containerAnimation: tw, start: 'left 85%', end: 'left 50%', scrub: true } }));
      });
      mm.add('(max-width: 900px)', () => {
        $$('.etape', piste).forEach((e) => gsap.from(e, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: e, start: 'top 88%' } }));
      });
    }
    if (page === 'soins') {
      const liste = $$('.etape-soin'), vis = $('[data-visuel]');
      if (vis) {
        const cadres = $$('.cadre', vis);
        liste.forEach((li, i) => ScrollTrigger.create({
          trigger: li, start: 'top 55%', end: 'bottom 55%',
          onToggle: (s) => { if (!s.isActive) return; liste.forEach((x) => x.classList.toggle('actif', x === li)); cadres.forEach((c, k) => c.classList.toggle('actif', k === i)); vis.className = `etapes-soin__visuel etape-${i + 1}`; }
        }));
      }
      const couches = $('[data-couches]');
      if (couches) {
        const anneaux = $$('.anneau', couches), coeur = $('.coeur', couches);
        const tl = gsap.timeline({ scrollTrigger: { trigger: couches, start: 'top 75%', end: 'bottom 30%', scrub: 0.8 } });
        anneaux.forEach((a, i) => tl.to(a, { scale: 1.28, opacity: 0, duration: 1, ease: 'power2.in' }, i * 0.55));
        tl.fromTo(coeur, { scale: 0.75, filter: 'brightness(.85)' }, { scale: 1.35, filter: 'brightness(1.08)', duration: anneaux.length * 0.55 + 0.5, ease: 'power1.inOut' }, 0);
      }
    }
    if (page === 'journees') {
      const toiles = $('[data-toiles]'), tp = $('[data-toiles-piste]');
      mm.add('(min-width: 901px)', () => {
        const dist = () => Math.max(0, tp.scrollWidth - tp.parentElement.clientWidth);
        gsap.to(tp, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: toiles.closest('section'), start: 'top top', end: () => `+=${dist() + innerHeight * 0.3}`, pin: true, scrub: 0.8, invalidateOnRefresh: true } });
      });
      $$('.toile').forEach((t, i) => gsap.from(t, { y: 70, rotate: i % 2 ? 2 : -2, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: toiles, start: 'top 75%' }, delay: Math.min(i, 3) * 0.08 }));
      $$('.deroule .pastille').forEach((p, i) => gsap.from(p, { scale: 0, duration: 0.8, delay: i * 0.12, ease: 'back.out(2)', scrollTrigger: { trigger: p.closest('ol'), start: 'top 82%' } }));
    }
  }

  function init() { agenda(); tiroir(); respiration(); }
  window.TCVpages = { init, animations, revert: () => { if (mm) { mm.revert(); mm = null; } } };
})();
