/**
 * world.js — where the islands sit, and the path the camera takes through them.
 *
 * The flight is a list of waypoints, not a hand-tuned animation. Each island
 * contributes the same five-beat block:
 *
 *   approach  high and outside, the whole diorama in frame
 *   descend   dropping toward it
 *   inside    down among the props — this is where the copy is readable
 *   through   still moving, now aimed at the way out
 *   away      risen back up, the next island already in view
 *
 * Two parallel curves are built from those waypoints: one the camera rides,
 * one its gaze rides. Sampling both at the same parameter is what keeps the
 * look-at from lagging or whipping through a turn.
 *
 * Each waypoint also carries a `weight`, its share of total scroll distance.
 * That is the pacing dial: raise `inside` to dwell longer in a scene, raise
 * `transit` to make the hops between islands feel longer.
 */
import * as THREE from 'three';
import { SCENES } from './scenes.js';
import { P, mat, cloud, tree, island, rand, at, group } from './kit.js';

const UP = new THREE.Vector3(0, 1, 0);

/** Island centres, laid out as a horseshoe with the finale raised over it. */
export const ISLANDS = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(31, -2, -31),
  new THREE.Vector3(8, 3, -68),
  new THREE.Vector3(-33, -1, -88),
  new THREE.Vector3(-64, 2, -53),
  new THREE.Vector3(-38, 16, -17),
];

const WEIGHTS = { approach: 1.05, descend: 0.85, inside: 1.5, through: 0.85, transit: 1.35 };

/** Scroll spent parked in front of a subject, in the same units as WEIGHTS. */
const HOLD_WEIGHT = 1.4;

/** The angle the film opens on, before there is a previous island to come from. */
const OPENING = new THREE.Vector3(0.42, 0, 1).normalize();

const entryDir = (i) => (ISLANDS[i - 1] ? flat(ISLANDS[i - 1].clone().sub(ISLANDS[i])) : OPENING.clone());
const exitDir = (i) => (ISLANDS[i + 1] ? flat(ISLANDS[i + 1].clone().sub(ISLANDS[i])) : entryDir(i).negate());

/**
 * Which way a diorama should face. Every scene is modelled with its good side
 * toward +z, so each island is turned to the middle of the camera's sweep past
 * it — arriving, orbiting and leaving all land on a three-quarter view instead
 * of whichever side the layout happened to put there.
 */
function facing(i) {
  const sum = entryDir(i).add(exitDir(i));
  return sum.lengthSq() < 0.05 ? entryDir(i) : sum.normalize();
}

export function buildWorld(scene) {
  const tickables = [];
  const focusWorld = [];
  const billboards = [];

  ISLANDS.forEach((c, i) => {
    const g = SCENES[i]();
    g.position.copy(c);
    const face = facing(i);
    g.rotation.y = Math.atan2(face.x, face.z);
    scene.add(g);
    if (g.userData.tick) tickables.push(g.userData.tick);

    // Flat information panels — the org chart, the week, the floating cards —
    // are staged to turn with the camera. Read edge-on they become slivers, and
    // as diegetic UI rather than scenery, facing the viewer is the honest read.
    for (const obj of g.userData.billboards || []) {
      let baseY = 0;
      for (let p = obj.parent; p; p = p.parent) baseY += p.rotation.y;
      billboards.push({ obj, baseY });
    }

    const f = g.userData.focus.clone();
    f.applyEuler(g.rotation);
    focusWorld.push(f.add(c));
  });

  // Path first: the scenery is then placed *around* the flight, which is the
  // only reliable way to stop a stray island parking itself in the lens.
  const waypoints = buildPath(focusWorld);
  scatter(scene, waypoints.curve);

  return { waypoints, tickables, billboards };
}

/**
 * Radii are measured from the scene's focus point, not the island centre, and
 * never drop below RADIUS.inside. An island is about 9 units across with props
 * standing 5-9 units tall, so anything nearer than that puts the camera inside
 * a roof. The close beat is an *orbit* — in on one side, around, out on the
 * other — which keeps the whole diorama in frame and the lens out of the walls.
 */
const RADIUS = { descend: 22, inside: 14, through: 16 };
const HEIGHT = { descend: 13, inside: 8.5, through: 10 };

function buildPath(focusWorld) {
  const wp = [];
  const n = ISLANDS.length;
  const centre = ISLANDS.reduce((a, v) => a.add(v), new THREE.Vector3()).divideScalar(n);

  // `plain` is the same gaze without the off-centre framing bias. Both curves
  // are built, and the renderer blends between them: wide viewports get the
  // composed shot, narrow ones get the subject back in the middle where it fits.
  const push = (pos, look, weight, section, kind, plain = look) =>
    wp.push({ pos, look, weight, section, kind, plain });

  for (let i = 0; i < n; i++) {
    const c = ISLANDS[i];
    const focus = focusWorld[i];
    const prev = ISLANDS[i - 1];
    const next = ISLANDS[i + 1];

    const inDir = entryDir(i);
    const outDir = exitDir(i);

    const gapIn = prev ? prev.distanceTo(c) : 46;
    const gapOut = next ? next.distanceTo(c) : 44;

    push(
      focus.clone().addScaledVector(inDir, gapIn * 0.55).setY(c.y + 17),
      focus.clone(),
      i === 0 ? 0.75 : WEIGHTS.approach, i, 'approach',
    );
    push(
      focus.clone().addScaledVector(inDir, RADIUS.descend).setY(focus.y + HEIGHT.descend),
      focus.clone(),
      WEIGHTS.descend, i, 'descend',
    );
    // Aim a little to one side of the subject so it settles right of centre,
    // clear of the copy block in the bottom-left corner.
    const insidePos = focus.clone().addScaledVector(inDir, RADIUS.inside).setY(focus.y + HEIGHT.inside);
    const right = new THREE.Vector3()
      .crossVectors(focus.clone().sub(insidePos).normalize(), UP)
      .normalize();
    push(
      insidePos,
      focus.clone().addScaledVector(right, -3.2).setY(focus.y + 0.5),
      WEIGHTS.inside, i, 'inside',
      focus.clone().setY(focus.y + 0.5),
    );

    if (next) {
      // Swing round to the exit side, still looking back into the scene, then
      // start turning toward wherever we are going next.
      const mid = arcDir(inDir, outDir);
      push(
        focus.clone().addScaledVector(mid, RADIUS.through).setY(focus.y + HEIGHT.through),
        focus.clone().lerp(next.clone().setY(next.y + 4), 0.3),
        WEIGHTS.through, i, 'through',
      );
      push(
        focus.clone().addScaledVector(outDir, gapOut * 0.42).setY(c.y + 14),
        next.clone().setY(next.y + 3),
        WEIGHTS.transit, i, 'away',
      );
    } else {
      // Finale: lift off the deck, then pull back until the whole world fits.
      push(
        focus.clone().addScaledVector(arcDir(inDir, outDir), RADIUS.through).setY(focus.y + 9),
        centre.clone().setY(centre.y + 4),
        1.0, i, 'through',
      );
      const back = flat(c.clone().sub(centre));
      push(
        centre.clone().addScaledVector(back, 88).setY(centre.y + 66),
        centre.clone(),
        1.7, i, 'reveal',
      );
    }
  }

  // Waypoint weights are the cost of *arriving* at that waypoint, so the first
  // one is free and the stops run 0 → 1 across the remaining n-1 segments.
  const total = wp.slice(1).reduce((s, w) => s + w.weight, 0);
  let acc = 0;
  wp[0].stop = 0;
  for (let i = 1; i < wp.length; i++) {
    acc += wp[i].weight;
    wp[i].stop = acc / total;
  }

  // Each subject gets a stretch of scroll where the camera holds completely
  // still, rather than easing past it. The hold is scroll the flight does not
  // spend moving, so it is added to the timeline rather than taken out of it.
  const holds = wp
    .filter((w) => w.kind === 'inside')
    .map((w) => ({ at: w.stop, width: HOLD_WEIGHT / total }));

  const spline = (key) => new THREE.CatmullRomCurve3(wp.map((w) => w[key]), false, 'centripetal', 0.5);

  return {
    list: wp, holds,
    curve: spline('pos'), gaze: spline('look'), gazePlain: spline('plain'),
    count: wp.length,
  };
}

function flat(v) {
  v.y = 0;
  return v.normalize();
}

/**
 * A heading between entry and exit, weighted toward the exit. When those two
 * are near-opposite the blend collapses to nothing, so fall back to a
 * perpendicular — that still arcs the camera round the island instead of
 * letting it stall on an undefined direction.
 */
function arcDir(inDir, outDir) {
  const m = inDir.clone().multiplyScalar(0.4).addScaledVector(outDir, 0.6);
  if (m.lengthSq() < 0.05) m.set(-outDir.z, 0, outDir.x);
  return m.normalize();
}

/**
 * Everything that is not a scene: clouds for depth, plus a scatter of small
 * uninhabited islands so the world reads as bigger than the six stops on it,
 * and so the long hops between islands have something to pass.
 *
 * Candidates are generated generously and then rejected on clearance from the
 * flight path — near enough to read, never near enough to fill the lens. Doing
 * it by measurement rather than by hand-picked coordinates means the scenery
 * stays out of frame even after the path is re-tuned.
 */
function scatter(scene, curve) {
  const centre = ISLANDS.reduce((a, v) => a.add(v), new THREE.Vector3()).divideScalar(ISLANDS.length);
  const path = curve.getSpacedPoints(420);

  const clearance = (p) => {
    let min = Infinity;
    for (const q of path) {
      const d = p.distanceToSquared(q);
      if (d < min) min = d;
    }
    return Math.sqrt(min);
  };

  // Islands: keep those that clear the path but stay inside the fogged shell.
  let placed = 0;
  for (let i = 0; i < 90 && placed < 22; i++) {
    const a = rand(i * 3.7) * Math.PI * 2;
    const r = 18 + rand(i * 9.1) * 86;
    const p = new THREE.Vector3(
      centre.x + Math.cos(a) * r,
      centre.y - 14 + rand(i * 5.3) * 34,
      centre.z + Math.sin(a) * r * 0.95,
    );
    if (clearance(p) < 30) continue;
    const s = 3.2 + rand(i * 11.3) * 3.2;
    const g = group(island(s, s * 0.8, { seed: i * 17 + 3, rocks: 2 }));
    if (rand(i * 13) > 0.35) g.add(tree(i * 9 + 5, 0.8 + rand(i) * 0.5));
    if (rand(i * 19) > 0.6) g.add(at(tree(i * 4 + 2, 0.7), s * 0.24, 0, -s * 0.18));
    g.position.copy(p);
    g.rotation.y = rand(i * 23) * Math.PI;
    // Background scenery: too far for its shadows to be legible, so it stays
    // out of the shadow pass entirely.
    g.traverse((o) => { o.castShadow = false; });
    scene.add(g);
    placed++;
  }

  // Clouds need far more clearance than their centre suggests: a cluster at
  // scale 3 is roughly 15 units across, so anything closer reads as fog on the
  // lens rather than weather — which is exactly what swallowed the final shot.
  let clouds = 0;
  for (let i = 0; i < 120 && clouds < 26; i++) {
    const a = rand(i * 3.1) * Math.PI * 2;
    const r = 26 + rand(i * 7.7) * 78;
    const p = new THREE.Vector3(
      centre.x + Math.cos(a) * r,
      centre.y + 8 + rand(i * 11) * 36,
      centre.z + Math.sin(a) * r,
    );
    if (clearance(p) < 44) continue;
    const c = cloud(i * 5 + 1, 1.6 + rand(i * 2.3) * 1.5);
    c.position.copy(p);
    scene.add(c);
    clouds++;
  }

  // A few motes drifting in the light. Cheap, and they sell the sense of scale.
  // One instanced mesh rather than seventy objects: identical on screen, but a
  // single draw call and no per-object matrix bookkeeping each frame.
  const seeds = [];
  for (let i = 0; i < 200 && seeds.length < 70; i++) {
    const p = new THREE.Vector3(
      centre.x + (rand(i * 5) - 0.5) * 180,
      centre.y + rand(i * 9) * 48 - 8,
      centre.z + (rand(i * 13) - 0.5) * 180,
    );
    if (clearance(p) < 9) continue;
    seeds.push({ pos: p, scale: 0.09 + rand(i * 3) * 0.08, phase: rand(i * 17) * Math.PI * 2 });
  }

  const motes = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 5, 3),
    mat(P.paper, { rough: 1 }),
    seeds.length,
  );
  motes.castShadow = false;
  motes.receiveShadow = false;
  motes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  motes.frustumCulled = false;
  motes.userData.seeds = seeds;
  scene.add(motes);
  scene.userData.motes = motes;
}
