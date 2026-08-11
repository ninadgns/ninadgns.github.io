/**
 * main.js — renderer, the scroll → camera mapping, and the overlay chrome.
 *
 * Scroll drives one number, `progress` (0 → 1). Everything visual is a pure
 * function of it: camera position, gaze, which copy block is legible, which
 * rail dot is lit. Nothing here animates on its own except the idle scene
 * ticks and the drifting motes, so stopping the scroll stops the film.
 */
import * as THREE from 'three';
import { buildWorld } from './world.js';
import { SECTIONS } from './content.js';
import './style.css';

const root = document.getElementById('app');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);

// Framing. A three.js camera holds *vertical* FOV fixed, so on a phone held
// upright the horizontal view collapses to a slot and the diorama falls out of
// frame. The film is composed for a wide viewport, so narrow ones widen the lens
// toward the same horizontal angle, cap it before it goes fish-eyed, and make up
// the shortfall by pulling the camera back along its own sight line.
const BASE_FOV = 46;
const REF_ASPECT = 16 / 9;
const MAX_FOV = 62;
const MAX_PULL = 1.9;
const H_HALF = Math.tan(THREE.MathUtils.degToRad(BASE_FOV / 2)) * REF_ASPECT;

const THEMES = {
  day: {
    // Fog reaches well past the world's diagonal so the closing pull-back still
    // resolves the far islands instead of dissolving them into the sky.
    top: '#eaf2ef', bottom: '#f7f1e6', fog: 0xeef2ec, fogNear: 70, fogFar: 330,
    sun: 0xfff1dd, sunI: 2.5, sky: 0xdfeaf0, ground: 0xd9cdb6, hemiI: 1.15, fill: 0x9fb8c4, fillI: 0.5,
    exposure: 1.0,
  },
  dusk: {
    top: '#243239', bottom: '#4a3b3a', fog: 0x33403f, fogNear: 60, fogFar: 300,
    sun: 0xffcf9a, sunI: 2.2, sky: 0x4d6472, ground: 0x2a2f2c, hemiI: 0.75, fill: 0x5f7f96, fillI: 0.45,
    exposure: 1.06,
  },
};

boot();

function boot() {
  const ui = buildUI();

  // A browser that cannot (or should not) run the flight still gets the whole
  // page, just as a document. Same copy, same links, no camera.
  if (reduced.matches || !webglAvailable()) {
    document.documentElement.classList.add('sw-static');
    ui.enable3d.hidden = !webglAvailable();
    ui.enable3d.addEventListener('click', () => {
      document.documentElement.classList.remove('sw-static');
      start(ui);
    });
    return;
  }
  start(ui);
}

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

function start(ui) {
  if (start.done) return;
  start.done = true;

  const dark = window.matchMedia('(prefers-color-scheme: dark)');
  let theme = dark.matches ? THEMES.dusk : THEMES.day;

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = theme.exposure;
  renderer.domElement.className = 'sw-canvas';
  root.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(BASE_FOV, innerWidth / innerHeight, 0.5, 500);

  applyTheme();

  const hemi = new THREE.HemisphereLight(theme.sky, theme.ground, theme.hemiI);
  scene.add(hemi);

  // One sun, with a tight shadow frustum that follows the camera's gaze.
  // A frustum big enough for the whole world would smear every contact shadow.
  const sun = new THREE.DirectionalLight(theme.sun, theme.sunI);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.camera.left = -26;
  sun.shadow.camera.right = 26;
  sun.shadow.camera.top = 26;
  sun.shadow.camera.bottom = -26;
  sun.shadow.bias = -0.0007;
  sun.shadow.normalBias = 0.035;
  scene.add(sun, sun.target);

  const fill = new THREE.DirectionalLight(theme.fill, theme.fillI);
  fill.position.set(-24, 14, -18);
  scene.add(fill);

  const { waypoints, tickables, billboards } = buildWorld(scene);
  const motes = scene.userData.motes;
  const moteBase = motes.children.map((m) => m.position.y);

  // Copy is up for as long as the camera is near its scene — from halfway
  // through the approach to halfway out again — so it reads at a normal pace
  // instead of flashing past. The hops between islands stay deliberately clean.
  const bands = SECTIONS.map((s, i) => {
    const list = waypoints.list;
    const idx = list.findIndex((w) => w.section === i && w.kind === 'inside');
    const lerp = THREE.MathUtils.lerp;
    return {
      peak: list[idx].stop,
      enter: i === 0 ? -1 : lerp(list[idx - 2].stop, list[idx - 1].stop, 0.5),
      leave: s.isFinale ? 1.1 : lerp(list[idx + 1].stop, list[idx + 2].stop, 0.5),
    };
  });

  ui.mount(bands, (stop) => {
    scrollTo({ top: stop * maxScroll(), behavior: 'smooth' });
  });

  let progress = 0;
  let target = 0;
  let lastW = innerWidth;
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const plainLook = new THREE.Vector3();
  const smoothLook = new THREE.Vector3();
  const spin = new THREE.Vector3();
  let pull = 1;
  let bias = 1;
  const sunOffset = new THREE.Vector3(18, 30, 14);

  // Read-only handle for tuning the flight from the console.
  window.__scrollWorld = { camera, waypoints, get progress() { return progress; } };

  applyFraming();
  sizeScroller();
  sample(0);
  camera.position.subVectors(camPos, camLook).multiplyScalar(pull).add(camLook);
  smoothLook.copy(camLook);
  camera.lookAt(smoothLook);

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onResize);
  dark.addEventListener?.('change', () => {
    theme = dark.matches ? THEMES.dusk : THEMES.day;
    applyTheme();
    hemi.color.setHex(theme.sky);
    hemi.groundColor.setHex(theme.ground);
    hemi.intensity = theme.hemiI;
    sun.color.setHex(theme.sun);
    sun.intensity = theme.sunI;
    fill.color.setHex(theme.fill);
    fill.intensity = theme.fillI;
    renderer.toneMappingExposure = theme.exposure;
  });

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // Frame-rate independent damping. The lag is the point: it turns a jumpy
    // trackpad flick into a camera move with weight.
    progress += (target - progress) * (1 - Math.exp(-7.5 * dt));
    if (Math.abs(target - progress) < 1e-5) progress = target;

    sample(progress);
    camera.position.subVectors(camPos, camLook).multiplyScalar(pull).add(camLook);
    smoothLook.lerp(camLook, 1 - Math.exp(-9 * dt));
    camera.lookAt(smoothLook);

    sun.target.position.copy(smoothLook);
    sun.position.copy(smoothLook).add(sunOffset);

    for (const b of billboards) {
      b.obj.getWorldPosition(spin);
      b.obj.rotation.y = Math.atan2(camera.position.x - spin.x, camera.position.z - spin.z) - b.baseY;
    }

    for (const tick of tickables) tick(t);
    motes.children.forEach((m, i) => {
      m.position.y = moteBase[i] + Math.sin(t * 0.25 + m.userData.phase) * 1.4;
    });

    ui.update(progress);
    renderer.render(scene, camera);
  });

  requestAnimationFrame(() => document.documentElement.classList.add('sw-ready'));

  function applyTheme() {
    scene.background = gradientTexture(theme.top, theme.bottom);
    scene.fog = new THREE.Fog(theme.fog, theme.fogNear, theme.fogFar);
    document.documentElement.style.setProperty('--sw-sky', theme.bottom);
  }

  function maxScroll() {
    return Math.max(1, document.body.scrollHeight - innerHeight);
  }

  function onScroll() {
    target = clamp(scrollY / maxScroll(), 0, 1);
    if (scrollY > 40) document.documentElement.classList.add('sw-scrolled');
  }

  function onResize() {
    // Mobile browsers fire resize when the URL bar slides away. Reacting to
    // that re-sizes the scroller mid-scroll and the page appears to jump.
    const widthChanged = innerWidth !== lastW;
    lastW = innerWidth;
    applyFraming();
    renderer.setSize(innerWidth, innerHeight);
    if (widthChanged) {
      sizeScroller();
      target = clamp(scrollY / maxScroll(), 0, 1);
    }
  }

  function applyFraming() {
    const aspect = innerWidth / innerHeight;
    const deg = THREE.MathUtils.degToRad;
    const wantV = THREE.MathUtils.radToDeg(Math.atan(H_HALF / aspect) * 2);
    camera.fov = Math.min(wantV, MAX_FOV);
    pull = Math.min(Math.tan(deg(wantV / 2)) / Math.tan(deg(camera.fov / 2)), MAX_PULL);
    // Off-centre framing only survives where there is width to spare for it.
    bias = clamp((aspect - 0.9) / 0.6, 0, 1);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }

  function sizeScroller() {
    const per = innerWidth < 760 ? 2.0 : 2.35;
    ui.scroller.style.height = `${Math.round(innerHeight * per * SECTIONS.length)}px`;
  }

  /** progress → a point on the flight, with per-beat easing. */
  function sample(p) {
    const list = waypoints.list;
    let k = 0;
    while (k < list.length - 2 && p > list[k + 1].stop) k++;
    const a = list[k].stop;
    const b = list[k + 1].stop;
    const local = clamp((p - a) / (b - a || 1e-6), 0, 1);

    // Ease into the beats that matter and stay near-linear elsewhere, so the
    // camera settles while the copy is up without stalling at every waypoint.
    const kind = list[k + 1].kind;
    const amt = kind === 'inside' ? 0.55 : kind === 'reveal' ? 0.45 : 0.22;
    const eased = local * (1 - amt) + smoother(local) * amt;

    const u = (k + eased) / (list.length - 1);
    waypoints.curve.getPoint(u, camPos);
    waypoints.gaze.getPoint(u, camLook);
    if (bias < 1) {
      waypoints.gazePlain.getPoint(u, plainLook);
      camLook.lerp(plainLook, 1 - bias);
    }
  }
}

function gradientTexture(top, bottom) {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const ctx = c.getContext('2d');
  const grd = ctx.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, top);
  grd.addColorStop(1, bottom);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------------------ ui --- */

function buildUI() {
  const scroller = el('div', 'sw-scroller');
  const panels = el('div', 'sw-panels');
  const rail = el('nav', 'sw-rail');
  rail.setAttribute('aria-label', 'Sections');

  const home = el('a', 'sw-home');
  home.href = '/';
  home.innerHTML = '<span aria-hidden="true">←</span> ninadgns.github.io';

  const hint = el('div', 'sw-hint');
  hint.innerHTML = '<span class="sw-hint-dot"></span>Scroll to fly';

  const enable3d = el('button', 'sw-enable');
  enable3d.type = 'button';
  enable3d.textContent = 'Play the 3D flight';

  const staticNote = el('p', 'sw-static-note');
  staticNote.textContent = 'Motion is reduced, so the flight is paused and the tour is laid out as a page.';

  const cards = SECTIONS.map((s, i) => {
    const card = el('article', 'sw-card');
    card.id = `sec-${s.id}`;
    card.style.setProperty('--accent', s.accent);
    card.innerHTML = `
      <p class="sw-eyebrow">${s.eyebrow}</p>
      <h2 class="sw-title">${s.title}</h2>
      <p class="sw-body">${s.body}</p>
      ${s.tags.length ? `<ul class="sw-tags">${s.tags.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
      ${s.href ? `<a class="sw-link" href="${s.href}">${s.linkLabel}<span aria-hidden="true">→</span></a>` : ''}
    `;
    panels.append(card);

    const dot = el('button', 'sw-dot');
    dot.type = 'button';
    dot.setAttribute('aria-label', s.eyebrow);
    dot.innerHTML = `<span class="sw-dot-label">${s.eyebrow}</span>`;
    dot.dataset.index = String(i);
    rail.append(dot);
    return card;
  });

  const staticHead = el('header', 'sw-static-head');
  staticHead.innerHTML = '<h1>ninadgns, in three dimensions</h1>';
  staticHead.append(staticNote, enable3d);

  document.getElementById('app').append(staticHead, panels, rail, home, hint, scroller);

  let bands = [];
  let onJump = () => {};

  rail.addEventListener('click', (e) => {
    const dot = e.target.closest('.sw-dot');
    if (dot) onJump(bands[Number(dot.dataset.index)].peak);
  });

  return {
    scroller, enable3d,
    mount(b, jump) { bands = b; onJump = jump; },
    update(p) {
      let active = 0;
      let best = Infinity;
      bands.forEach((b, i) => {
        const fade = 0.03;
        const o = smoothstep(b.enter - fade, b.enter + fade, p) * (1 - smoothstep(b.leave, b.leave + fade, p));
        const card = cards[i];
        card.style.opacity = o.toFixed(3);
        card.style.transform = `translateY(${((1 - o) * 22).toFixed(2)}px)`;
        card.style.pointerEvents = o > 0.55 ? 'auto' : 'none';
        card.setAttribute('aria-hidden', o > 0.55 ? 'false' : 'true');
        const d = Math.abs(p - b.peak);
        if (d < best) { best = d; active = i; }
      });
      rail.children[active].classList.add('is-active');
      [...rail.children].forEach((d, i) => d.classList.toggle('is-active', i === active));
    },
  };
}

function el(tag, cls) {
  const n = document.createElement(tag);
  n.className = cls;
  return n;
}
