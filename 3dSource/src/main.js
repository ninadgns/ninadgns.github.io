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

/**
 * Segment easing with independent control of each end, so a leg can leave a
 * standstill without lurching and arrive at one without snapping.
 * `a` eases the start, `b` the end; 0 is linear, 1 is zero velocity. A convex
 * blend of four monotonic curves, so the result is always monotonic too.
 */
function shape(t, a, b) {
  const easeIn = t * t;
  const easeOut = 1 - (1 - t) * (1 - t);
  return (1 - a) * (1 - b) * t
    + a * (1 - b) * easeIn
    + (1 - a) * b * easeOut
    + a * b * smoother(t);
}

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
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // The shadow pass is the most expensive thing in the frame, but it cannot be
  // throttled here: the sun below follows the camera's gaze, so its shadow
  // matrix is stale the moment the camera moves and every receiver samples the
  // wrong space. The saving came from cutting casters instead (see kit/world) —
  // if this ever needs more, pin the sun to a fixed direction first.
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
  sun.shadow.mapSize.set(1536, 1536);
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
  const holds = waypoints.holds;
  const totalHold = holds.reduce((sum, h) => sum + h.width, 0);
  const motes = scene.userData.motes;
  const moteSeeds = motes.userData.seeds;
  const moteM = new THREE.Matrix4();
  const moteP = new THREE.Vector3();
  const moteQ = new THREE.Quaternion();
  const moteS = new THREE.Vector3();

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

  ui.mount(bands, (i) => {
    scrollTo({ top: holdCentre(i) * maxScroll(), behavior: 'smooth' });
  });

  let progress = 0;
  let target = 0;
  let lastW = innerWidth;
  let hinted = false;
  // Cached because reading scrollHeight forces layout, and the scroll handler
  // runs far more often than the scroller's height ever changes.
  let scrollSpan = 1;
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const plainLook = new THREE.Vector3();
  const smoothLook = new THREE.Vector3();
  const spin = new THREE.Vector3();
  let pull = 1;
  let bias = 1;
  const sunOffset = new THREE.Vector3(18, 30, 14);

  // Read-only handle for tuning the flight from the console.
  window.__scrollWorld = { camera, renderer, scene, waypoints, get progress() { return progress; } };

  applyFraming();
  sizeScroller();
  sample(toBase(0));
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

    const base = toBase(progress);
    sample(base);
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
    for (let i = 0; i < moteSeeds.length; i++) {
      const seed = moteSeeds[i];
      moteP.set(seed.pos.x, seed.pos.y + Math.sin(t * 0.25 + seed.phase) * 1.4, seed.pos.z);
      moteS.setScalar(seed.scale);
      motes.setMatrixAt(i, moteM.compose(moteP, moteQ, moteS));
    }
    motes.instanceMatrix.needsUpdate = true;

    ui.update(base);
    renderer.render(scene, camera);
  });

  requestAnimationFrame(() => document.documentElement.classList.add('sw-ready'));

  function applyTheme() {
    scene.background = gradientTexture(theme.top, theme.bottom);
    scene.fog = new THREE.Fog(theme.fog, theme.fogNear, theme.fogFar);
    document.documentElement.style.setProperty('--sw-sky', theme.bottom);
  }

  /**
   * Derived, never measured. Everything except the scroller is position:fixed,
   * so the document's scrollable span is just the height this code already set
   * minus the viewport. Reading scrollHeight here instead would both force a
   * layout and, at startup, risk sampling the page before its stylesheet has
   * applied — which silently rescales the whole flight.
   */
  function setScrollSpan(scrollerHeight) {
    scrollSpan = Math.max(1, scrollerHeight - innerHeight);
  }
  function maxScroll() {
    return scrollSpan;
  }

  function onScroll() {
    target = clamp(scrollY / scrollSpan, 0, 1);
    if (scrollY > 40 && !hinted) {
      hinted = true;
      document.documentElement.classList.add('sw-scrolled');
    }
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
    const h = Math.round(innerHeight * per * SECTIONS.length * (1 + totalHold));
    ui.scroller.style.height = `${h}px`;
    setScrollSpan(h);
  }

  /**
   * Extended scroll → the base flight timeline. The stretches of scroll spent
   * held in front of a subject are flat here: the camera parameter stops
   * changing entirely, so the shot is genuinely still rather than merely slow.
   */
  function toBase(p) {
    const q = p * (1 + totalHold);
    let acc = 0;
    for (const h of holds) {
      const start = h.at + acc;
      if (q < start) break;
      if (q <= start + h.width) return h.at;
      acc += h.width;
    }
    return clamp(q - acc, 0, 1);
  }

  /** Where a subject's hold sits in scroll, used by the rail to land on it. */
  function holdCentre(i) {
    let acc = 0;
    for (let k = 0; k < i; k++) acc += holds[k].width;
    return (holds[i].at + acc + holds[i].width / 2) / (1 + totalHold);
  }

  /** base timeline → a point on the flight, with per-beat easing. */
  function sample(p) {
    const list = waypoints.list;
    let k = 0;
    while (k < list.length - 2 && p > list[k + 1].stop) k++;
    const a = list[k].stop;
    const b = list[k + 1].stop;
    const local = clamp((p - a) / (b - a || 1e-6), 0, 1);

    // A leg that touches a held shot must start or finish at a standstill,
    // otherwise the camera jumps from moving to parked in a single frame.
    const from = list[k].kind;
    const to = list[k + 1].kind;
    const easeStart = from === 'inside' ? 1 : 0.25;
    const easeEnd = to === 'inside' ? 1 : to === 'reveal' ? 0.5 : 0.25;
    const eased = shape(local, easeStart, easeEnd);

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
  const shown = SECTIONS.map(() => -1);
  const live = SECTIONS.map(() => null);
  let activeDot = -1;

  rail.addEventListener('click', (e) => {
    const dot = e.target.closest('.sw-dot');
    if (dot) onJump(Number(dot.dataset.index));
  });

  return {
    scroller, enable3d,
    mount(b, jump) { bands = b; onJump = jump; },
    /**
     * Called every frame, so it writes nothing unless a value actually moved.
     * Unconditional writes here meant ~30 style invalidations per frame on the
     * main thread, competing with the scroll it is supposed to be following.
     */
    update(p) {
      let active = 0;
      let best = Infinity;

      for (let i = 0; i < bands.length; i++) {
        const b = bands[i];
        const fade = 0.03;
        const o = smoothstep(b.enter - fade, b.enter + fade, p) * (1 - smoothstep(b.leave, b.leave + fade, p));
        const card = cards[i];
        const prev = shown[i];

        // A hundredth of opacity is below the eye's threshold at these sizes.
        if (Math.abs(o - prev) > 0.005 || (o === 0) !== (prev === 0)) {
          card.style.opacity = o.toFixed(3);
          card.style.transform = o > 0.999 ? '' : `translateY(${((1 - o) * 22).toFixed(2)}px)`;
          shown[i] = o;

          const interactive = o > 0.55;
          if (interactive !== live[i]) {
            card.style.pointerEvents = interactive ? 'auto' : 'none';
            card.setAttribute('aria-hidden', interactive ? 'false' : 'true');
            live[i] = interactive;
          }
        }

        const d = Math.abs(p - b.peak);
        if (d < best) { best = d; active = i; }
      }

      if (active !== activeDot) {
        rail.children[activeDot]?.classList.remove('is-active');
        rail.children[active].classList.add('is-active');
        activeDot = active;
      }
    },
  };
}

function el(tag, cls) {
  const n = document.createElement(tag);
  n.className = cls;
  return n;
}
