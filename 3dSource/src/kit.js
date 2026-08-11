/**
 * kit.js — the shared vocabulary every diorama is built from.
 *
 * Everything in this world is primitives: rounded boxes, cylinders, cones. The
 * "clay" read comes from three things applied consistently, not from detail:
 * generous corner radii, fully matte materials, and a palette that never widens.
 * Add a new shape here rather than inlining geometry in a scene, so the whole
 * world keeps drifting toward the same look instead of away from it.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const P = {
  cream: 0xf2ede3,
  paper: 0xfbf9f5,
  sand: 0xe3d6be,
  dune: 0xd6c4a4,
  clay: 0xd98f63,
  rust: 0xc16e4a,
  leaf: 0x7fb069,
  leafDeep: 0x5a8a4e,
  green: 0x1f9d63,
  greenLt: 0x34c27e,
  ink: 0x33413b,
  slate: 0x6e8079,
  stone: 0xb9bfb6,
  wood: 0xc99a6b,
  glow: 0xffd48a,
  sky: 0xdce7e4,
  water: 0x8fc4c9,
};

// Materials are shared by colour+finish. A diorama re-uses the same few dozen,
// so caching keeps the draw-call state changes down and the look uniform.
const matCache = new Map();

export function mat(color, opts = {}) {
  const { flat = false, rough = 0.92, emissive = 0, emissiveIntensity = 1, transparent = false, opacity = 1 } = opts;
  const key = `${color}|${flat}|${rough}|${emissive}|${emissiveIntensity}|${transparent}|${opacity}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: rough,
      metalness: 0,
      flatShading: flat,
      emissive,
      emissiveIntensity,
      transparent,
      opacity,
    });
    matCache.set(key, m);
  }
  return m;
}

/** Emissive-only material for windows, screens and light sources. */
export function lit(color, intensity = 1) {
  return mat(color, { emissive: color, emissiveIntensity: intensity, rough: 0.6 });
}

const geoCache = new Map();
function cached(key, build) {
  let g = geoCache.get(key);
  if (!g) { g = build(); geoCache.set(key, g); }
  return g;
}

/** Rounded box — the workhorse. Radius auto-clamps so thin slabs stay valid. */
export function rbox(w, h, d, color, opts = {}) {
  const r = Math.min(opts.radius ?? 0.08, Math.min(w, h, d) / 2.05);
  const seg = opts.segments ?? 2;
  const g = cached(`rb${w},${h},${d},${r},${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, r));
  return finish(new THREE.Mesh(g, mat(color, opts)), opts);
}

/** Hard-edged box, for anything that should read as cut rather than moulded. */
export function box(w, h, d, color, opts = {}) {
  const g = cached(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d));
  return finish(new THREE.Mesh(g, mat(color, opts)), opts);
}

export function cyl(rTop, rBot, h, color, opts = {}) {
  const seg = opts.segments ?? 16;
  const g = cached(`c${rTop},${rBot},${h},${seg}`, () => new THREE.CylinderGeometry(rTop, rBot, h, seg));
  return finish(new THREE.Mesh(g, mat(color, opts)), opts);
}

export function sphere(r, color, opts = {}) {
  const seg = opts.segments ?? 16;
  const g = cached(`s${r},${seg}`, () => new THREE.SphereGeometry(r, seg, Math.max(6, seg / 2)));
  return finish(new THREE.Mesh(g, mat(color, opts)), opts);
}

export function cone(r, h, color, opts = {}) {
  const seg = opts.segments ?? 12;
  const g = cached(`co${r},${h},${seg}`, () => new THREE.ConeGeometry(r, h, seg));
  return finish(new THREE.Mesh(g, mat(color, opts)), opts);
}

/** Triangular prism, used for every pitched roof in the world. */
export function prism(w, h, d, color, opts = {}) {
  const g = cached(`p${w},${h},${d}`, () => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(w / 2, 0);
    shape.lineTo(0, h);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
    geo.translate(0, 0, -d / 2);
    return geo;
  });
  return finish(new THREE.Mesh(g, mat(color, opts)), opts);
}

/** Box whose underside is pinched inward — the floating islands' keel. */
export function tapered(w, h, d, color, taper, opts = {}) {
  const g = cached(`t${w},${h},${d},${taper}`, () => {
    const geo = new THREE.BoxGeometry(w, h, d, 1, 1, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) < 0) {
        pos.setX(i, pos.getX(i) * taper);
        pos.setZ(i, pos.getZ(i) * taper);
      }
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  });
  return finish(new THREE.Mesh(g, mat(color, opts)), opts);
}

/** A soft tube through points — power lines, org-chart links, paths. */
export function tube(points, radius, color, opts = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => (p.isVector3 ? p : new THREE.Vector3(...p))));
  const g = new THREE.TubeGeometry(curve, opts.steps ?? 24, radius, opts.radial ?? 6, false);
  return finish(new THREE.Mesh(g, mat(color, opts)), opts);
}

function finish(mesh, opts) {
  mesh.castShadow = opts.cast !== false;
  mesh.receiveShadow = opts.receive !== false;
  if (opts.pos) mesh.position.set(...opts.pos);
  if (opts.rot) mesh.rotation.set(...opts.rot);
  if (opts.scale) {
    if (Array.isArray(opts.scale)) mesh.scale.set(...opts.scale);
    else mesh.scale.setScalar(opts.scale);
  }
  return mesh;
}

export function group(...children) {
  const g = new THREE.Group();
  children.flat().filter(Boolean).forEach((c) => g.add(c));
  return g;
}

export function at(obj, x, y, z) {
  obj.position.set(x, y, z);
  return obj;
}

/* ---------------------------------------------------------------- props --- */

/** Deterministic jitter, so a reload never reshuffles the world. */
export function rand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function tree(seed = 1, scale = 1) {
  const g = new THREE.Group();
  const trunkH = 0.7 + rand(seed) * 0.5;
  g.add(at(cyl(0.09, 0.13, trunkH, P.wood, { segments: 7 }), 0, trunkH / 2, 0));
  const tiers = 2 + Math.floor(rand(seed + 3) * 2);
  const tint = rand(seed + 9) > 0.5 ? P.leaf : P.leafDeep;
  for (let i = 0; i < tiers; i++) {
    const r = 0.62 - i * 0.15;
    g.add(at(cone(r, 0.75, tint, { segments: 8, flat: true }), 0, trunkH + 0.28 + i * 0.42, 0));
  }
  g.scale.setScalar(scale);
  return g;
}

export function bush(seed = 1, scale = 1) {
  const g = new THREE.Group();
  const tint = rand(seed) > 0.5 ? P.leaf : P.leafDeep;
  for (let i = 0; i < 3; i++) {
    const r = 0.26 + rand(seed + i) * 0.16;
    g.add(at(sphere(r, tint, { segments: 8, flat: true }),
      (rand(seed + i * 2) - 0.5) * 0.5, r * 0.8, (rand(seed + i * 5) - 0.5) * 0.5));
  }
  g.scale.setScalar(scale);
  return g;
}

/** Cluster of spheres. Shadowless and never a shadow receiver, so clouds stay airy. */
export function cloud(seed = 1, scale = 1) {
  const g = new THREE.Group();
  const n = 3 + Math.floor(rand(seed) * 3);
  for (let i = 0; i < n; i++) {
    const r = 0.9 + rand(seed + i * 7) * 0.9;
    const s = sphere(r, P.paper, { segments: 10, flat: true, cast: false, receive: false, rough: 1 });
    at(s, (i - n / 2) * 1.1 + rand(seed + i) * 0.4, rand(seed + i * 3) * 0.5, rand(seed + i * 11) * 0.7);
    g.add(s);
  }
  g.scale.setScalar(scale);
  return g;
}

/**
 * Crisp text on a plane. Unlit on purpose — a sign that dims as the camera
 * swings past reads as a bug, so labels ignore the lighting entirely.
 */
export function label(text, opts = {}) {
  const {
    color = '#33413b', bg = null, weight = 700, align = 'center',
    px = 132, pad = 0.22, height = 0.5, radius = 0,
  } = opts;
  const font = `${weight} ${px}px ui-sans-serif, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

  const measure = document.createElement('canvas').getContext('2d');
  measure.font = font;
  const textW = Math.ceil(measure.measureText(text).width);
  const padPx = Math.ceil(px * pad);
  const cw = THREE.MathUtils.ceilPowerOfTwo(textW + padPx * 2);
  const ch = THREE.MathUtils.ceilPowerOfTwo(px * 1.5);

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');

  if (bg) {
    ctx.fillStyle = bg;
    if (radius > 0) {
      const r = radius * ch;
      ctx.beginPath();
      ctx.roundRect(0, 0, cw, ch, r);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, cw, ch);
    }
  }
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = align;
  ctx.fillText(text, align === 'center' ? cw / 2 : padPx, ch / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.minFilter = THREE.LinearFilter;

  const w = height * (cw / ch);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, height),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }),
  );
  mesh.userData.width = w;
  return finish(mesh, { ...opts, cast: false, receive: false });
}

/**
 * A floating island: rounded ground slab over a pinched keel, with a rock or
 * two hanging beneath so the underside reads as broken-off earth, not a box.
 */
export function island(w, d, opts = {}) {
  const g = new THREE.Group();
  const top = opts.top ?? P.leaf;
  const soil = opts.soil ?? P.sand;
  const seed = opts.seed ?? 1;

  // The slab receives (props sit on it) but casts nothing: an island floats
  // alone, so its own shadow falls into empty sky. Keeping the ground out of
  // the shadow pass is most of the saving, since it is the biggest mesh here.
  g.add(at(rbox(w, 1.0, d, top, { radius: 0.34, segments: 3, cast: false }), 0, -0.5, 0));
  g.add(at(tapered(w - 0.5, 2.6, d - 0.5, soil, 0.55, { cast: false }), 0, -2.3, 0));
  g.add(at(tapered(w - 3.4, 3.2, d - 3.4, P.dune, 0.25, { cast: false }), 0, -4.9, 0));

  const rocks = opts.rocks ?? 3;
  for (let i = 0; i < rocks; i++) {
    const r = 0.4 + rand(seed + i * 13) * 0.5;
    g.add(at(sphere(r, P.dune, { segments: 7, flat: true, cast: false }),
      (rand(seed + i) - 0.5) * w * 0.7,
      -5.5 - rand(seed + i * 3) * 2.6,
      (rand(seed + i * 5) - 0.5) * d * 0.7));
  }
  return g;
}
