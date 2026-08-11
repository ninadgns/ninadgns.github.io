/**
 * scenes.js — one diorama per thing on the site.
 *
 * Every scene returns a Group carrying two bits of contract in userData:
 *   focus — local-space point the camera aims at while it is inside the scene
 *   tick  — optional per-frame idle motion, driven by clock time (never scroll),
 *           so the world stays alive when the visitor stops scrolling
 *
 * Ground level is y = 0 in every scene, so props can be placed without thinking
 * about the slab underneath them.
 */
import * as THREE from 'three';
import {
  P, rbox, box, cyl, sphere, cone, prism, tube, label, group, at,
  tree, bush, island, rand, lit,
} from './kit.js';

/* ------------------------------------------------------------- shared ----- */

/** Wall with a punched opening, built as a frame rather than a CSG subtraction. */
function walledWindow(w, h, t, color, holeW, holeH, holeY) {
  const g = group();
  const side = (w - holeW) / 2;
  g.add(at(rbox(side, h, t, color, { radius: 0.05 }), -(holeW / 2 + side / 2), h / 2, 0));
  g.add(at(rbox(side, h, t, color, { radius: 0.05 }), holeW / 2 + side / 2, h / 2, 0));
  g.add(at(rbox(holeW, holeY, t, color, { radius: 0.05 }), 0, holeY / 2, 0));
  const topH = h - holeY - holeH;
  if (topH > 0.02) g.add(at(rbox(holeW, topH, t, color, { radius: 0.05 }), 0, holeY + holeH + topH / 2, 0));
  g.add(at(box(holeW - 0.1, holeH - 0.1, 0.05, P.sky, { emissive: P.sky, emissiveIntensity: 0.35 }), 0, holeY + holeH / 2, 0));
  return g;
}

function pitchedHouse(w, d, wallH, roofH, wallC, roofC) {
  const g = group();
  g.add(at(rbox(w, wallH, d, wallC, { radius: 0.1 }), 0, wallH / 2, 0));
  g.add(at(prism(w + 0.45, roofH, d + 0.45, roofC, { flat: true }), 0, wallH, 0));
  return g;
}

/** Four tapered legs and crossbars — enough lattice to read as a pylon. */
function pylon(h) {
  const g = group();
  const base = 0.85, topR = 0.3;
  const legs = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  for (const [sx, sz] of legs) {
    const pts = [
      new THREE.Vector3(sx * base, 0, sz * base),
      new THREE.Vector3(sx * topR, h, sz * topR),
    ];
    g.add(tube(pts, 0.075, P.slate, { steps: 2, radial: 5 }));
  }
  for (const level of [0.28, 0.55, 0.8]) {
    const y = h * level;
    const r = base + (topR - base) * level;
    g.add(at(box(r * 2, 0.08, 0.08, P.slate), 0, y, -r));
    g.add(at(box(r * 2, 0.08, 0.08, P.slate), 0, y, r));
    g.add(at(box(0.08, 0.08, r * 2, P.slate), -r, y, 0));
    g.add(at(box(0.08, 0.08, r * 2, P.slate), r, y, 0));
  }
  g.add(at(box(2.4, 0.1, 0.1, P.slate), 0, h - 0.15, 0));
  g.add(at(box(1.7, 0.1, 0.1, P.slate), 0, h - 0.75, 0));
  return g;
}

/** Card that hangs in the air with a label on it — used by several scenes. */
function floatCard(w, h, color, text, opts = {}) {
  const g = group();
  g.add(rbox(w, h, 0.12, color, { radius: 0.09 }));
  if (text) {
    const l = label(text, { height: opts.textH ?? h * 0.42, color: opts.textColor ?? '#33413b', weight: 700 });
    at(l, 0, opts.textY ?? 0, 0.075);
    g.add(l);
  }
  return g;
}

/* ------------------------------------------------------- 1. the desk ----- */

export function sceneDesk() {
  const g = group();
  g.add(island(15, 12, { top: P.cream, seed: 11 }));

  // Deliberately low. The camera sweeps right around this island, so full-height
  // walls would present a blank white back on the way out; at knee height the
  // room still reads as a room from every angle the flight actually uses.
  const wallC = P.paper;
  const back = walledWindow(13.6, 2.6, 0.36, wallC, 3.2, 1.3, 0.75);
  at(back, 0, 0, -5.4);
  g.add(back);
  const left = walledWindow(8.4, 2.6, 0.36, wallC, 2.4, 1.2, 0.8);
  at(left, -6.6, 0, -1.0);
  left.rotation.y = Math.PI / 2;
  g.add(left);

  g.add(at(rbox(6.4, 0.07, 4.6, P.greenLt, { radius: 0.04 }), 0.6, 0.04, 1.4));

  // desk
  const desk = group();
  desk.add(at(rbox(5.2, 0.18, 2.1, P.wood, { radius: 0.07 }), 0, 1.2, 0));
  for (const [x, z] of [[-2.3, -0.8], [2.3, -0.8], [-2.3, 0.8], [2.3, 0.8]]) {
    desk.add(at(cyl(0.08, 0.09, 1.2, P.ink, { segments: 8 }), x, 0.6, z));
  }
  at(desk, 0, 0, -2.4);
  g.add(desk);

  // laptop, screen facing the arriving camera
  const laptop = group();
  laptop.add(at(rbox(1.9, 0.09, 1.3, P.stone, { radius: 0.04 }), 0, 0.045, 0));
  const screen = group();
  screen.add(at(rbox(1.9, 1.25, 0.08, P.stone, { radius: 0.05 }), 0, 0.62, 0));
  screen.add(at(box(1.68, 1.05, 0.03, P.ink, { emissive: 0x0e1512, emissiveIntensity: 0.4 }), 0, 0.64, 0.055));
  const code = group();
  const lines = [[1.1, P.greenLt], [0.75, P.slate], [1.3, P.greenLt], [0.6, P.glow], [0.95, P.slate]];
  lines.forEach(([w, c], i) => {
    code.add(at(box(w, 0.07, 0.01, c, { emissive: c, emissiveIntensity: 0.9, cast: false, receive: false }),
      -0.82 + w / 2, 0.99 - i * 0.16, 0.075));
  });
  screen.add(code);
  screen.rotation.x = -0.28;
  at(screen, 0, 0.07, -0.6);
  laptop.add(screen);
  at(laptop, -0.1, 1.29, -2.5);
  g.add(laptop);

  // lamp
  const lamp = group();
  lamp.add(at(cyl(0.32, 0.36, 0.09, P.ink, { segments: 12 }), 0, 0.045, 0));
  lamp.add(at(cyl(0.05, 0.05, 1.15, P.ink, { segments: 8 }), 0, 0.6, 0));
  lamp.add(at(cone(0.4, 0.5, P.clay, { segments: 12, flat: true }), 0.28, 1.2, 0));
  const bulb = at(sphere(0.14, P.glow, { segments: 8, cast: false }), 0.28, 1.06, 0);
  bulb.material = lit(P.glow, 1.6);
  lamp.add(bulb);
  const lampLight = new THREE.PointLight(0xffd9a0, 6, 7, 2);
  at(lampLight, 0.28, 1.05, 0);
  lamp.add(lampLight);
  at(lamp, 2.0, 1.29, -2.7);
  g.add(lamp);

  // chair
  const chair = group();
  chair.add(at(rbox(1.15, 0.14, 1.1, P.ink, { radius: 0.06 }), 0, 0.95, 0));
  chair.add(at(rbox(1.1, 1.15, 0.14, P.ink, { radius: 0.06 }), 0, 1.55, 0.48));
  chair.add(at(cyl(0.09, 0.09, 0.9, P.slate, { segments: 8 }), 0, 0.45, 0));
  chair.add(at(cyl(0.5, 0.55, 0.09, P.slate, { segments: 10 }), 0, 0.05, 0));
  at(chair, -0.1, 0, -0.55);
  chair.rotation.y = 0.24;
  g.add(chair);

  // shelf against the left wall
  const shelf = group();
  shelf.add(at(rbox(0.5, 2.3, 3.4, P.wood, { radius: 0.05 }), 0, 1.15, 0));
  for (let s = 0; s < 3; s++) {
    const y = 0.5 + s * 0.62;
    let z = -1.4;
    for (let b = 0; b < 7; b++) {
      const bh = 0.42 + rand(s * 9 + b) * 0.24;
      const bw = 0.16 + rand(s * 5 + b) * 0.1;
      const c = [P.clay, P.green, P.glow, P.slate, P.rust][Math.floor(rand(s * 3 + b * 7) * 5)];
      shelf.add(at(rbox(0.34, bh, bw, c, { radius: 0.02 }), 0.06, y + bh / 2 - 0.08, z + bw / 2));
      z += bw + 0.03;
    }
  }
  at(shelf, -6.05, 0, -1.2);
  g.add(shelf);

  // plant + odds and ends
  const plant = group();
  plant.add(at(cyl(0.42, 0.32, 0.7, P.clay, { segments: 12 }), 0, 0.35, 0));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const leaf = cone(0.2, 1.1, i % 2 ? P.leaf : P.leafDeep, { segments: 6, flat: true });
    at(leaf, Math.cos(a) * 0.26, 1.15, Math.sin(a) * 0.26);
    leaf.rotation.z = Math.cos(a) * 0.42;
    leaf.rotation.x = -Math.sin(a) * 0.42;
    plant.add(leaf);
  }
  at(plant, 4.6, 0, -1.4);
  g.add(plant);

  g.add(at(cyl(0.22, 0.19, 0.34, P.paper, { segments: 12 }), 1.5, 1.46, -2.0));
  g.add(at(rbox(1.3, 0.1, 0.95, P.clay, { radius: 0.03 }), -2.0, 1.34, -2.2));

  const sign = label('ninadgns', { height: 0.46, color: '#1f9d63', weight: 800 });
  at(sign, 0, 1.85, -5.15);
  g.add(sign);

  g.userData.focus = new THREE.Vector3(0, 1.75, -2.4);
  g.userData.tick = (t) => {
    code.children.forEach((l, i) => {
      l.material.emissiveIntensity = 0.65 + Math.sin(t * 1.8 + i * 1.3) * 0.35;
    });
  };
  return g;
}

/* ------------------------------------------------------------ 2. cgpa ---- */

export function sceneCgpa() {
  const g = group();
  g.add(island(16, 13, { top: P.leaf, seed: 21 }));

  // academic block: steps, colonnade, entablature, pediment
  const hall = group();
  for (let s = 0; s < 3; s++) {
    hall.add(at(rbox(8.4 - s * 0.5, 0.26, 5.4 - s * 0.5, P.stone, { radius: 0.05 }), 0, 0.13 + s * 0.26, 0));
  }
  hall.add(at(rbox(6.6, 0.3, 4.2, P.paper, { radius: 0.05 }), 0, 0.92, 0));
  for (let i = 0; i < 6; i++) {
    const x = -2.75 + i * 1.1;
    hall.add(at(cyl(0.24, 0.27, 2.5, P.paper, { segments: 12 }), x, 2.3, 1.75));
  }
  hall.add(at(rbox(6.9, 0.42, 4.5, P.paper, { radius: 0.05 }), 0, 3.76, 0));
  hall.add(at(rbox(5.4, 2.4, 3.4, P.cream, { radius: 0.08 }), 0, 2.2, -0.4));
  hall.add(at(prism(7.1, 1.25, 4.6, P.clay, { flat: true }), 0, 3.97, 0));
  at(hall, 0, 0, -1.2);
  g.add(hall);

  // grade bars climbing toward the brand green
  const chart = group();
  const heights = [1.0, 1.45, 1.3, 1.9, 2.3, 2.9];
  heights.forEach((h, i) => {
    const c = i === heights.length - 1 ? P.green : i > 2 ? P.greenLt : P.stone;
    chart.add(at(rbox(0.62, h, 0.62, c, { radius: 0.08 }), i * 0.86, h / 2, 0));
  });
  const cap = label('3.92', { height: 0.44, color: '#1f9d63', weight: 800 });
  at(cap, heights.length * 0.86 - 0.86, 3.2, 0);
  chart.add(cap);
  at(chart, 3.1, 0, 2.6);
  chart.rotation.y = -0.34;
  g.add(chart);

  // floating transcript cards
  const cards = group();
  const marks = [['A+', P.paper], ['A', P.paper], ['B+', P.cream]];
  marks.forEach(([txt, c], i) => {
    const card = floatCard(1.35, 1.7, c, txt, { textH: 0.62, textColor: '#1f9d63' });
    at(card, -3.6 + i * 1.75, 4.6 + i * 0.32, 2.4);
    card.rotation.set(-0.12, 0.22 - i * 0.2, 0.05 - i * 0.05);
    cards.add(card);
  });
  g.add(cards);

  // books and a mortarboard on the lawn
  const books = group();
  [[2.1, P.rust], [1.9, P.green], [2.0, P.glow]].forEach(([w, c], i) => {
    books.add(at(rbox(w, 0.24, 1.4, c, { radius: 0.04 }), rand(i) * 0.12, 0.12 + i * 0.25, 0));
  });
  at(books, -4.2, 0, 3.0);
  books.rotation.y = 0.3;
  g.add(books);

  const mortar = group();
  mortar.add(at(cyl(0.42, 0.5, 0.42, P.ink, { segments: 12 }), 0, 0.21, 0));
  mortar.add(at(box(1.5, 0.09, 1.5, P.ink), 0, 0.47, 0));
  mortar.add(at(sphere(0.09, P.glow, { segments: 8 }), 0.55, 0.44, 0.55));
  at(mortar, -4.3, 0.85, 3.0);
  mortar.rotation.y = 0.5;
  g.add(mortar);

  [[-6.2, -3.4, 1.0], [6.3, -3.0, 0.9], [-6.5, 4.6, 0.8], [6.0, 4.4, 1.05]].forEach(([x, z, s], i) => {
    g.add(at(tree(i + 30, s), x, 0, z));
  });
  g.add(at(bush(41, 1.1), 5.0, 0, -4.4));

  // Sits between the hall, the floating cards and the bar chart rather than on
  // the hall itself, so the close pass frames all three instead of a roof.
  g.userData.billboards = cards.children;
  g.userData.focus = new THREE.Vector3(0, 3.4, 1.4);
  g.userData.tick = (t) => {
    cards.children.forEach((c, i) => {
      c.position.y = 4.6 + i * 0.32 + Math.sin(t * 0.8 + i * 1.7) * 0.16;
      c.rotation.z = 0.05 - i * 0.05 + Math.sin(t * 0.6 + i) * 0.03;
    });
  };
  return g;
}

/* ------------------------------------------------------------ 3. bpdb ---- */

export function sceneBpdb() {
  const g = group();
  g.add(island(17, 12, { top: P.leaf, soil: P.dune, seed: 31 }));

  const house = pitchedHouse(4.4, 3.6, 2.4, 1.5, P.cream, P.rust);
  at(house, -3.8, 0, -1.0);
  house.rotation.y = 0.18;
  g.add(house);

  // the meter, the whole point of the tracker
  const meter = group();
  meter.add(at(rbox(1.25, 1.6, 0.36, P.paper, { radius: 0.09 }), 0, 0, 0));
  meter.add(at(box(0.98, 0.52, 0.06, P.ink), 0, 0.32, 0.2));
  const digits = label('4 275', { height: 0.3, color: '#34c27e', weight: 800 });
  at(digits, 0, 0.32, 0.245);
  meter.add(digits);
  const led = at(sphere(0.075, P.greenLt, { segments: 8, cast: false }), -0.38, -0.32, 0.2);
  led.material = lit(P.greenLt, 2);
  meter.add(led);
  meter.add(at(label('kWh', { height: 0.17, color: '#6e8079', weight: 700 }), 0.28, -0.32, 0.21));
  at(meter, -1.6, 1.6, 0.85);
  meter.rotation.y = 0.18;
  g.add(meter);

  // transmission line marching across the island
  const towers = [[3.0, -3.2], [4.6, 0.6], [2.4, 4.2]];
  const heads = [];
  towers.forEach(([x, z], i) => {
    const h = 5.2 - i * 0.35;
    const p = pylon(h);
    at(p, x, 0, z);
    p.rotation.y = i * 0.22 - 0.2;
    g.add(p);
    heads.push(new THREE.Vector3(x, h - 0.15, z));
  });

  const lineCurves = [];
  for (let i = 0; i < heads.length - 1; i++) {
    const a = heads[i], b = heads[i + 1];
    for (const off of [-0.95, 0.95]) {
      const mid = a.clone().lerp(b, 0.5);
      mid.y -= 0.75;
      const pts = [
        a.clone().add(new THREE.Vector3(off, 0, 0)),
        mid.clone().add(new THREE.Vector3(off, 0, 0)),
        b.clone().add(new THREE.Vector3(off, 0, 0)),
      ];
      g.add(tube(pts, 0.045, P.ink, { steps: 16, radial: 5, cast: false }));
      lineCurves.push(new THREE.CatmullRomCurve3(pts));
    }
  }
  // house feed
  const feed = [new THREE.Vector3(3.0, 4.4, -3.2), new THREE.Vector3(0.4, 3.2, -1.8), new THREE.Vector3(-1.6, 2.5, 0.8)];
  g.add(tube(feed, 0.04, P.ink, { steps: 16, radial: 5, cast: false }));
  lineCurves.push(new THREE.CatmullRomCurve3(feed));

  // pulses that travel the wires
  const pulses = [];
  for (let i = 0; i < 7; i++) {
    const s = sphere(0.1, P.glow, { segments: 8, cast: false, receive: false });
    s.material = lit(P.glow, 2.4);
    g.add(s);
    pulses.push({ mesh: s, curve: lineCurves[i % lineCurves.length], offset: rand(i * 7) });
  }

  // transformer + a low substation shed
  const trafo = group();
  trafo.add(at(cyl(0.62, 0.62, 1.5, P.slate, { segments: 14 }), 0, 0.75, 0));
  trafo.add(at(cyl(0.7, 0.7, 0.16, P.ink, { segments: 14 }), 0, 1.56, 0));
  trafo.add(at(cyl(0.08, 0.08, 0.5, P.stone, { segments: 8 }), -0.28, 1.85, 0));
  trafo.add(at(cyl(0.08, 0.08, 0.5, P.stone, { segments: 8 }), 0.28, 1.85, 0));
  at(trafo, 5.6, 0, 3.4);
  g.add(trafo);

  g.add(at(rbox(2.6, 1.1, 1.8, P.stone, { radius: 0.08 }), 6.0, 0.55, -3.6));

  // recharge slips drifting over the house, the tracker's actual input
  const slips = group();
  [['৳ 1000', P.paper], ['৳ 500', P.paper]].forEach(([txt, c], i) => {
    const s = floatCard(1.5, 0.92, c, txt, { textH: 0.36, textColor: '#c16e4a' });
    at(s, -4.6 + i * 2.0, 5.4 + i * 0.5, 0.2);
    s.rotation.set(-0.2, 0.3 - i * 0.5, 0.08);
    slips.add(s);
  });
  g.add(slips);

  [[-6.6, -3.6, 0.95], [-6.2, 4.6, 1.1], [7.0, 0.4, 0.85]].forEach(([x, z, s], i) => {
    g.add(at(tree(i + 50, s), x, 0, z));
  });

  // Between the metered house and the pylon line, so the wires read as the
  // link between them. Aimed at the house alone this framed a blank roof.
  g.userData.billboards = slips.children;
  g.userData.focus = new THREE.Vector3(0.3, 2.8, 0.9);
  g.userData.tick = (t) => {
    pulses.forEach((p, i) => {
      const u = (t * 0.16 + p.offset) % 1;
      p.curve.getPoint(u, p.mesh.position);
      p.mesh.material.emissiveIntensity = 1.6 + Math.sin(t * 3 + i) * 0.8;
    });
    led.material.emissiveIntensity = 1.4 + Math.sin(t * 2.4) * 1.0;
    slips.children.forEach((s, i) => {
      s.position.y = 5.4 + i * 0.5 + Math.sin(t * 0.7 + i * 2.1) * 0.2;
      s.rotation.z = 0.08 + Math.sin(t * 0.5 + i) * 0.05;
    });
  };
  return g;
}

/* ------------------------------------------------------ 4. government ---- */

export function sceneGov() {
  const g = group();
  g.add(island(17, 13, { top: P.cream, soil: P.sand, seed: 41 }));

  // secretariat block with a dome
  const b = group();
  for (let s = 0; s < 4; s++) {
    b.add(at(rbox(9.0 - s * 0.45, 0.22, 6.0 - s * 0.45, P.stone, { radius: 0.04 }), 0, 0.11 + s * 0.22, 0));
  }
  b.add(at(rbox(7.2, 3.0, 4.6, P.paper, { radius: 0.08 }), 0, 2.4, 0));
  for (let i = 0; i < 8; i++) {
    b.add(at(cyl(0.2, 0.22, 2.6, P.cream, { segments: 12 }), -3.15 + i * 0.9, 2.2, 2.45));
  }
  b.add(at(rbox(7.6, 0.4, 5.2, P.cream, { radius: 0.05 }), 0, 4.1, 0));
  b.add(at(cyl(1.5, 1.75, 0.5, P.cream, { segments: 20 }), 0, 4.55, -0.3));
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    rbox(0.1, 0.1, 0.1, P.green).material,
  );
  dome.castShadow = true; dome.receiveShadow = true;
  at(dome, 0, 4.78, -0.3);
  b.add(dome);
  b.add(at(cyl(0.09, 0.09, 0.7, P.glow, { segments: 8 }), 0, 6.5, -0.3));
  b.add(at(sphere(0.17, P.glow, { segments: 10 }), 0, 6.95, -0.3));

  // windows
  for (let i = 0; i < 6; i++) {
    b.add(at(box(0.5, 0.8, 0.05, P.sky, { emissive: P.sky, emissiveIntensity: 0.4 }), -2.6 + i * 1.05, 2.6, -2.33));
  }
  at(b, 0, 0, -1.0);
  g.add(b);

  // the org chart itself, hanging over the building
  const chart = group();
  const nodes = [];
  const root = floatCard(2.3, 0.8, P.green, 'Cabinet', { textH: 0.34, textColor: '#fbf9f5' });
  at(root, 0, 9.4, 1.2);
  chart.add(root);
  nodes.push(root);

  const mids = ['Ministry', 'Division', 'Directorate'];
  const midPos = [];
  mids.forEach((txt, i) => {
    const x = (i - 1) * 3.1;
    const c = floatCard(2.5, 0.72, P.paper, txt, { textH: 0.3, textColor: '#33413b' });
    at(c, x, 7.9, 1.2);
    chart.add(c);
    nodes.push(c);
    midPos.push(new THREE.Vector3(x, 7.9, 1.2));
    chart.add(tube([new THREE.Vector3(0, 9.0, 1.2), new THREE.Vector3(x * 0.6, 8.5, 1.2), new THREE.Vector3(x, 8.26, 1.2)],
      0.035, P.slate, { steps: 10, radial: 5, cast: false, receive: false }));
  });

  midPos.forEach((mp, i) => {
    for (let k = 0; k < 2; k++) {
      const x = mp.x + (k - 0.5) * 1.5;
      const leaf = at(rbox(1.15, 0.5, 0.12, P.cream, { radius: 0.07 }), x, 6.6, 1.2);
      chart.add(leaf);
      nodes.push(leaf);
      chart.add(tube([mp.clone().add(new THREE.Vector3(0, -0.36, 0)),
        new THREE.Vector3(mp.x + (x - mp.x) * 0.6, 7.15, 1.2),
        new THREE.Vector3(x, 6.85, 1.2)], 0.03, P.slate, { steps: 8, radial: 5, cast: false, receive: false }));
    }
  });
  g.add(chart);

  // flagpole
  const pole = group();
  pole.add(at(cyl(0.5, 0.6, 0.3, P.stone, { segments: 12 }), 0, 0.15, 0));
  pole.add(at(cyl(0.07, 0.08, 4.6, P.paper, { segments: 8 }), 0, 2.3, 0));
  const flag = at(rbox(1.6, 1.0, 0.06, P.green, { radius: 0.03 }), 0.83, 4.1, 0);
  pole.add(flag);
  pole.add(at(sphere(0.3, P.rust, { segments: 12 }), 0.83, 4.1, 0.05));
  at(pole, -6.0, 0, 3.6);
  g.add(pole);

  [[6.4, 3.8, 1.0], [6.6, -3.8, 0.9], [-6.6, -3.4, 1.05]].forEach(([x, z, s], i) => {
    g.add(at(tree(i + 70, s), x, 0, z));
  });
  g.add(at(bush(77, 1.2), 3.4, 0, 4.6));
  g.add(at(bush(79, 1.0), -3.4, 0, 4.6));

  g.userData.billboards = [chart];
  g.userData.focus = new THREE.Vector3(0, 5.4, 1.0);
  g.userData.tick = (t) => {
    nodes.forEach((n, i) => {
      n.position.y += Math.sin(t * 0.7 + i * 0.9) * 0.0016;
    });
    flag.rotation.y = Math.sin(t * 1.4) * 0.16;
  };
  return g;
}

/* --------------------------------------------------------- 5. routine ---- */

export function sceneRoutine() {
  const g = group();
  g.add(island(16, 12, { top: P.leaf, seed: 51 }));

  // clock tower
  const tower = group();
  tower.add(at(rbox(2.6, 0.4, 2.6, P.stone, { radius: 0.06 }), 0, 0.2, 0));
  tower.add(at(rbox(2.1, 5.2, 2.1, P.paper, { radius: 0.09 }), 0, 3.0, 0));
  tower.add(at(rbox(2.5, 0.34, 2.5, P.cream, { radius: 0.06 }), 0, 5.75, 0));
  tower.add(at(rbox(1.8, 1.0, 1.8, P.cream, { radius: 0.08 }), 0, 6.4, 0));
  tower.add(at(prism(2.4, 1.5, 2.4, P.rust, { flat: true }), 0, 6.9, 0));

  const face = group();
  face.add(at(cyl(0.72, 0.72, 0.12, P.paper, { segments: 24, rot: [Math.PI / 2, 0, 0] }), 0, 0, 0));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    face.add(at(box(0.06, 0.13, 0.04, P.ink, { cast: false }), Math.sin(a) * 0.56, Math.cos(a) * 0.56, 0.07));
  }
  const hourHand = at(box(0.07, 0.38, 0.03, P.ink, { cast: false }), 0, 0.19, 0.09);
  const minHand = at(box(0.05, 0.54, 0.03, P.green, { cast: false }), 0, 0.27, 0.1);
  const hourPivot = group(hourHand); const minPivot = group(minHand);
  face.add(hourPivot, minPivot);
  face.add(at(sphere(0.07, P.rust, { segments: 8, cast: false }), 0, 0, 0.12));
  at(face, 0, 4.4, 1.08);
  tower.add(face);

  at(tower, -3.6, 0, -1.4);
  g.add(tower);

  // the week, floating as a grid
  const grid = group();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU'];
  const busy = new Set(['0-1', '1-0', '1-2', '2-1', '2-3', '3-0', '4-2', '3-3']);
  days.forEach((d, c) => {
    const x = (c - 2) * 1.5;
    grid.add(at(label(d, { height: 0.26, color: '#6e8079', weight: 700 }), x, 2.55, 0.08));
    for (let r = 0; r < 4; r++) {
      const y = 2.05 - r * 0.62;
      const on = busy.has(`${c}-${r}`);
      grid.add(at(rbox(1.32, 0.5, 0.1, on ? P.greenLt : P.paper, { radius: 0.07 }), x, y, 0));
    }
  });
  grid.add(at(label('CSEDU 28', { height: 0.36, color: '#1f9d63', weight: 800 }), 0, 3.15, 0.08));
  at(grid, 3.0, 4.4, 1.6);
  grid.rotation.y = -0.42;
  g.add(grid);

  // lecture hall
  const hall = pitchedHouse(5.2, 3.4, 2.2, 1.2, P.cream, P.clay);
  for (let i = 0; i < 4; i++) {
    hall.add(at(box(0.62, 0.85, 0.06, P.sky, { emissive: P.sky, emissiveIntensity: 0.4 }), -1.7 + i * 1.13, 1.3, 1.73));
  }
  at(hall, 2.6, 0, -2.8);
  hall.rotation.y = -0.14;
  g.add(hall);

  // path + benches
  g.add(tube([
    new THREE.Vector3(-6.4, 0.03, 3.4), new THREE.Vector3(-2.0, 0.03, 2.2),
    new THREE.Vector3(1.6, 0.03, 3.0), new THREE.Vector3(6.2, 0.03, 1.4),
  ], 0.5, P.sand, { steps: 30, radial: 4, cast: false }));

  for (const [x, z, ry] of [[-1.4, 4.0, 0.2], [3.4, 4.2, -0.3]]) {
    const bench = group();
    bench.add(at(rbox(1.7, 0.12, 0.5, P.wood, { radius: 0.04 }), 0, 0.44, 0));
    bench.add(at(rbox(1.7, 0.5, 0.1, P.wood, { radius: 0.04 }), 0, 0.72, -0.22));
    bench.add(at(box(0.1, 0.44, 0.44, P.ink), -0.7, 0.22, 0));
    bench.add(at(box(0.1, 0.44, 0.44, P.ink), 0.7, 0.22, 0));
    at(bench, x, 0, z);
    bench.rotation.y = ry;
    g.add(bench);
  }

  [[-6.4, -3.4, 1.05], [6.4, 4.2, 0.95], [0.4, 4.8, 0.85], [-5.2, 0.6, 1.1]].forEach(([x, z, s], i) => {
    g.add(at(tree(i + 90, s), x, 0, z));
  });

  // Midway between the clock tower and the floating week, high enough that the
  // grid does not crowd the lens on the close pass.
  g.userData.billboards = [grid];
  g.userData.focus = new THREE.Vector3(-0.2, 4.2, 0.4);
  g.userData.tick = (t) => {
    minPivot.rotation.z = -t * 0.55;
    hourPivot.rotation.z = -t * 0.055;
  };
  return g;
}

/* -------------------------------------------------------- 6. overlook ---- */

export function sceneOverlook() {
  const g = group();
  g.add(island(13, 11, { top: P.leaf, soil: P.dune, seed: 61, rocks: 4 }));

  // viewing deck out over the edge
  const deck = group();
  deck.add(at(rbox(6.4, 0.24, 4.2, P.wood, { radius: 0.06 }), 0, 0.12, 0));
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI * 0.5 + (i / 8) * Math.PI;
    const x = Math.sin(a) * 2.9, z = -Math.cos(a) * 1.9;
    deck.add(at(cyl(0.07, 0.08, 0.9, P.wood, { segments: 6 }), x, 0.69, z));
  }
  deck.add(tube([
    new THREE.Vector3(-2.9, 1.12, 0.0), new THREE.Vector3(-2.0, 1.12, -1.55),
    new THREE.Vector3(0, 1.12, -1.9), new THREE.Vector3(2.0, 1.12, -1.55),
    new THREE.Vector3(2.9, 1.12, 0.0),
  ], 0.06, P.wood, { steps: 24, radial: 5 }));
  at(deck, 0, 0, -2.6);
  g.add(deck);

  // signpost pointing back at every island
  const post = group();
  post.add(at(cyl(0.13, 0.15, 3.4, P.wood, { segments: 8 }), 0, 1.7, 0));
  const arms = [
    ['The Desk', P.green, 0.35],
    ['CGPA', P.clay, -0.9],
    ['BPDB', P.rust, 2.1],
    ['Org Chart', P.slate, 1.35],
    ['Routine', P.leafDeep, -1.9],
  ];
  arms.forEach(([txt, c, ry], i) => {
    const arm = group();
    const plank = at(rbox(2.3, 0.46, 0.1, c, { radius: 0.05 }), 1.15, 0, 0);
    arm.add(plank);
    const l = label(txt, { height: 0.24, color: '#fbf9f5', weight: 700 });
    at(l, 1.15, 0, 0.06);
    arm.add(l);
    at(arm, 0, 2.9 - i * 0.56, 0);
    arm.rotation.y = ry;
    post.add(arm);
  });
  at(post, -3.5, 0, 0.6);
  g.add(post);

  // the monument that closes the film
  const monument = group();
  monument.add(at(rbox(4.6, 0.3, 2.4, P.stone, { radius: 0.05 }), 0, 0.15, 0));
  monument.add(at(rbox(3.8, 0.28, 1.9, P.cream, { radius: 0.05 }), 0, 0.44, 0));
  const slab = at(rbox(3.4, 1.9, 0.3, P.paper, { radius: 0.1 }), 0, 1.5, 0);
  monument.add(slab);
  monument.add(at(label('ninadgns', { height: 0.42, color: '#1f9d63', weight: 800 }), 0, 1.78, 0.17));
  monument.add(at(label('.github.io', { height: 0.26, color: '#6e8079', weight: 600 }), 0, 1.26, 0.17));
  at(monument, 3.2, 0, -0.4);
  monument.rotation.y = -0.5;
  g.add(monument);

  // telescope on the rail
  const scope = group();
  scope.add(at(cyl(0.12, 0.16, 1.2, P.ink, { segments: 10 }), 0, 0.6, 0));
  const barrel = group();
  barrel.add(at(cyl(0.19, 0.24, 1.5, P.slate, { segments: 12, rot: [Math.PI / 2, 0, 0] }), 0, 0, 0));
  barrel.add(at(cyl(0.13, 0.13, 0.3, P.ink, { segments: 10, rot: [Math.PI / 2, 0, 0] }), 0, 0, 0.85));
  barrel.rotation.x = 0.24;
  at(barrel, 0, 1.28, 0);
  scope.add(barrel);
  at(scope, 1.4, 0.24, -3.4);
  g.add(scope);

  const bench = group();
  bench.add(at(rbox(1.9, 0.14, 0.56, P.wood, { radius: 0.04 }), 0, 0.46, 0));
  bench.add(at(rbox(1.9, 0.56, 0.1, P.wood, { radius: 0.04 }), 0, 0.76, -0.24));
  bench.add(at(box(0.11, 0.46, 0.48, P.ink), -0.78, 0.23, 0));
  bench.add(at(box(0.11, 0.46, 0.48, P.ink), 0.78, 0.23, 0));
  at(bench, -1.2, 0, 2.8);
  bench.rotation.y = 2.9;
  g.add(bench);

  [[-5.2, -2.6, 1.0], [5.0, 2.8, 1.1], [-4.6, 3.4, 0.9]].forEach(([x, z, s], i) => {
    g.add(at(tree(i + 110, s), x, 0, z));
  });
  g.add(at(bush(115, 1.2), 4.4, 0, -3.0));

  g.userData.focus = new THREE.Vector3(1.4, 1.6, -1.2);
  g.userData.tick = (t) => {
    barrel.rotation.y = Math.sin(t * 0.25) * 0.32;
  };
  return g;
}

export const SCENES = [sceneDesk, sceneCgpa, sceneBpdb, sceneGov, sceneRoutine, sceneOverlook];
