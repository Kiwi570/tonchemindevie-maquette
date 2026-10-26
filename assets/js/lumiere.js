/* Lumière WebGL des ouvertures : particules qui contournent la main (magnétisme, sans contact)
   et brume qui se dissipe (soins). Sans WebGL ou en Mode calme, l’image de fond suffit. */
(() => {
  'use strict';
  const cv = document.querySelector('canvas[data-lumiere]');
  if (!cv || typeof window.OGL === 'undefined') { if (cv) cv.remove(); return; }
  const { Renderer, Geometry, Program, Mesh, Triangle } = window.OGL;
  const html = document.documentElement;
  const calme = () => html.classList.contains('calme');
  const mode = cv.dataset.lumiere;
  const mobile = matchMedia('(max-width: 720px)').matches;

  let renderer;
  try {
    renderer = new Renderer({ canvas: cv, alpha: true, premultipliedAlpha: false, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5) });
  } catch (e) { cv.remove(); return; }
  const gl = renderer.gl;
  if (!gl) { cv.remove(); return; }
  gl.clearColor(0, 0, 0, 0);

  /* ---- brume (fond plein écran) ---- */
  let brume = null;
  if (mode === 'brume') {
    const prog = new Program(gl, {
      vertex: `attribute vec2 position; attribute vec2 uv; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`,
      fragment: `precision highp float; varying vec2 vUv;
        uniform float uTemps, uDissipe, uAspect; uniform vec2 uMain; uniform float uMainForce;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i=0;i<5;i++){ v += a*n(p); p *= 2.02; a *= 0.5; } return v; }
        void main(){
          vec2 p = vUv; p.x *= uAspect;
          float t = uTemps * 0.035;
          float f = fbm(p*2.2 + vec2(t, t*0.4)) * 0.65 + fbm(p*5.0 - vec2(t*1.6, 0.0)) * 0.35;
          float bande = smoothstep(0.0, 0.55, vUv.y) * smoothstep(1.05, 0.35, vUv.y);
          float dens = f * (0.55 + 0.45*bande);
          vec2 m = uMain; m.x *= uAspect;
          float dm = distance(p, m);
          float clair = smoothstep(0.42, 0.0, dm) * uMainForce;
          float a = clamp((dens - uDissipe) * 1.6, 0.0, 1.0) * (1.0 - clair*0.85);
          vec3 c = mix(vec3(0.99, 0.96, 0.90), vec3(1.0, 0.90, 0.72), smoothstep(0.2, 0.9, vUv.y));
          gl_FragColor = vec4(c, a * 0.9);
        }`,
      uniforms: { uTemps: { value: 0 }, uDissipe: { value: -0.2 }, uAspect: { value: 1 }, uMain: { value: [0.5, 0.5] }, uMainForce: { value: 0 } },
      transparent: true, depthTest: false
    });
    brume = new Mesh(gl, { geometry: new Triangle(gl), program: prog });
  }

  /* ---- particules de lumière ---- */
  const N = mode === 'brume' ? (mobile ? 160 : 360) : (mobile ? 360 : 900);
  const pos = new Float32Array(N * 2), alea = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    pos[i * 2] = Math.random() * 2 - 1; pos[i * 2 + 1] = Math.random() * 2 - 1;
    alea[i * 4] = 0.3 + Math.random() * 0.9; alea[i * 4 + 1] = Math.random() * 6.283; alea[i * 4 + 2] = Math.random(); alea[i * 4 + 3] = Math.random();
  }
  const geo = new Geometry(gl, { position: { size: 2, data: pos }, alea: { size: 4, data: alea } });
  const progP = new Program(gl, {
    vertex: `precision highp float; attribute vec2 position; attribute vec4 alea;
      uniform float uTemps, uAspect, uDpr, uRayon, uDefile; uniform vec2 uMain; uniform float uMainForce;
      varying float vA; varying float vTeinte; varying float vProche;
      void main(){
        float t = uTemps;
        vec2 p = position;
        p.y = mod(p.y + 1.0 + t * 0.018 * alea.x + uDefile * 0.6, 2.0) - 1.0;
        p.x += sin(t * 0.35 * alea.x + alea.y) * 0.035;
        p.y += cos(t * 0.27 * alea.x + alea.y) * 0.025;
        vec2 q = vec2(p.x * uAspect, p.y);
        vec2 m = vec2(uMain.x * uAspect, uMain.y);
        vec2 d = q - m; float l = length(d) + 1e-4;
        float influence = smoothstep(uRayon * 1.9, 0.0, l) * uMainForce;
        vec2 dir = d / l;
        /* repoussées jusqu’au cercle, puis en orbite : la main ne touche jamais */
        q += dir * max(0.0, uRayon - l) * 1.05 * uMainForce;
        q += vec2(-dir.y, dir.x) * influence * 0.07 * (0.6 + alea.z);
        p = vec2(q.x / uAspect, q.y);
        vProche = influence;
        vA = 0.35 + 0.65 * alea.w;
        vTeinte = alea.z;
        gl_Position = vec4(p, 0.0, 1.0);
        gl_PointSize = (1.4 + alea.z * 3.2 + influence * 3.5) * uDpr;
      }`,
    fragment: `precision highp float; varying float vA; varying float vTeinte; varying float vProche;
      void main(){
        vec2 c = gl_PointCoord - 0.5; float d = length(c);
        float a = smoothstep(0.5, 0.0, d); a *= a;
        vec3 or = vec3(1.0, 0.86, 0.55), ivoire = vec3(1.0, 0.97, 0.9), ciel = vec3(0.6, 0.86, 0.95);
        vec3 col = vTeinte < 0.62 ? mix(ivoire, or, vTeinte / 0.62) : mix(or, ciel, (vTeinte - 0.62) / 0.38);
        gl_FragColor = vec4(col, a * vA * (0.55 + vProche * 0.7));
      }`,
    uniforms: { uTemps: { value: 0 }, uAspect: { value: 1 }, uDpr: { value: renderer.dpr }, uRayon: { value: 0.16 }, uMain: { value: [0.4, -0.2] }, uMainForce: { value: 0 }, uDefile: { value: 0 } },
    transparent: true, depthTest: false
  });
  progP.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
  const points = new Mesh(gl, { mode: gl.POINTS, geometry: geo, program: progP });

  /* ---- taille, pointeur, visibilité ---- */
  const hote = cv.parentElement;
  let W = 1, H = 1;
  function taille() {
    const r = hote.getBoundingClientRect(); W = r.width; H = r.height;
    renderer.setSize(W, H);
    const asp = W / H;
    progP.uniforms.uAspect.value = asp;
    progP.uniforms.uRayon.value = mobile ? 0.2 : 0.15;
    if (brume) brume.program.uniforms.uAspect.value = asp;
  }
  taille();
  window.addEventListener('resize', taille);

  const cible = { x: 0.3, y: -0.3, force: 0 }, actuel = { x: 0.3, y: -0.3, force: 0 };
  function surPointeur(e) {
    const r = cv.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) { cible.force = 0; return; }
    cible.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    cible.y = 1 - ((e.clientY - r.top) / r.height) * 2;
    cible.force = 1;
  }
  window.addEventListener('pointermove', surPointeur, { passive: true });
  window.addEventListener('pointerdown', surPointeur, { passive: true });
  document.addEventListener('pointerleave', () => { cible.force = 0; });

  let visible = true, actif = !calme(), t0 = performance.now(), defile = 0, dernierDefile = window.scrollY;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible && actif) requestAnimationFrame(rendu); }).observe(cv);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && actif) requestAnimationFrame(rendu); });
  window.addEventListener('tcv:calme', (e) => { actif = !e.detail; if (actif) { cv.style.display = ''; requestAnimationFrame(rendu); } else { cv.style.display = 'none'; } });
  if (!actif) cv.style.display = 'none';

  /* en tactile sans pointeur : une main virtuelle dérive lentement */
  const tactile = matchMedia('(hover: none)').matches;

  function rendu(now) {
    if (!visible || !actif || document.hidden) return;
    const t = (now - t0) / 1000;
    if (tactile && cible.force === 0) { cible.x = Math.sin(t * 0.25) * 0.5; cible.y = -0.2 + Math.cos(t * 0.18) * 0.35; cible.force = 0.8; }
    actuel.x += (cible.x - actuel.x) * 0.07; actuel.y += (cible.y - actuel.y) * 0.07; actuel.force += (cible.force - actuel.force) * 0.05;
    const sy = window.scrollY; defile += (sy - dernierDefile) / Math.max(H, 1); dernierDefile = sy;
    const u = progP.uniforms;
    u.uTemps.value = t; u.uMain.value = [actuel.x, actuel.y]; u.uMainForce.value = actuel.force; u.uDefile.value = defile;
    if (brume) {
      const b = brume.program.uniforms;
      b.uTemps.value = t;
      /* la brume s’ouvre doucement à l’arrivée puis avec le défilement */
      const ouverture = Math.min(1, t / 4.5);
      b.uDissipe.value = -0.25 + ouverture * 0.62 + Math.min(0.5, sy / Math.max(H, 1) * 0.6);
      b.uMain.value = [(actuel.x + 1) / 2, (actuel.y + 1) / 2];
      b.uMainForce.value = actuel.force;
      renderer.autoClear = true;
      renderer.render({ scene: brume });
      renderer.autoClear = false;
      renderer.render({ scene: points });
      renderer.autoClear = true;
    } else {
      renderer.render({ scene: points });
    }
    requestAnimationFrame(rendu);
  }
  if (actif) requestAnimationFrame(rendu);
})();
