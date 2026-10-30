import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function mount(el) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seed = 7;
  const R = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const sy = z => z < 10 ? (10 - z) * 0.13 : 0;

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x2c2a8a, 25, 120);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 900);
  const disposables = [], keep = o => (disposables.push(o), o);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // Canvas textures
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = keep(new THREE.CanvasTexture(c)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const hsl = (h, s, l) => `hsl(${h} ${s}% ${l}%)`;
  const rrect = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
  const stoneT = canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#17131f'; g.fillRect(0, 0, W, H);
    for (let y = 0; y < H;) { const rh = 18 + R() * 16; for (let x = -R() * 40; x < W;) { const bw = 26 + R() * 40; const l = 30 + R() * 22; g.fillStyle = R() < .12 ? hsl(130, 22, l * .7) : hsl(250 + R() * 30, 8 + R() * 8, l); rrect(g, x + 2, y + 2, bw - 4, rh - 4, 6); g.fillStyle = 'rgba(255,255,255,.08)'; rrect(g, x + 4, y + 3, bw - 10, 4, 2); x += bw; } y += rh; } });
  const cobbleT = canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#120f1a'; g.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 21) for (let x = (y / 21 % 2) * 14 - 14; x < W + 14; x += 28) { g.fillStyle = hsl(270 + R() * 50, 10 + R() * 14, 36 + R() * 22); g.beginPath(); g.ellipse(x + R() * 4, y + 10 + R() * 3, 12 + R() * 2, 8.5, R() * .4, 0, 7); g.fill(); g.fillStyle = 'rgba(255,230,255,.12)'; g.beginPath(); g.ellipse(x - 2, y + 7, 7, 3.5, 0, 0, 7); g.fill(); } });
  const slateT = canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#0d1512'; g.fillRect(0, 0, W, H);
    for (let y = 0, r = 0; y < H; y += 26, r++) for (let x = (r % 2) * 14 - 14; x < W; x += 28) { g.fillStyle = hsl(150 + R() * 30, 14 + R() * 10, 20 + R() * 12); rrect(g, x + 1.5, y, 25, 24, [0, 0, 6, 6]); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + 1.5, y + 20, 25, 4); } });
  const woodT = canvasTex(128, 256, (g, W, H) => { for (let x = 0; x < W; x += 32) { g.fillStyle = hsl(22 + R() * 8, 45, 22 + R() * 10); g.fillRect(x, 0, 32, H); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); const gx = x + 4 + R() * 24; g.moveTo(gx, 0); g.bezierCurveTo(gx + 4, H * .3, gx - 4, H * .6, gx + 2, H); g.stroke(); } g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x, 0, 2, H); } });
  const plasterT = canvasTex(128, 128, (g, W, H) => { g.fillStyle = '#9a7656'; g.fillRect(0, 0, W, H); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${R() < .5 ? '0,0,0' : '255,230,200'},${R() * .08})`; g.fillRect(R() * W, R() * H, 2 + R() * 6, 2 + R() * 6); } });
  const winT = canvasTex(128, 128, (g, W, H) => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 90); r.addColorStop(0, '#fff4b8'); r.addColorStop(.5, '#ffc24a'); r.addColorStop(1, '#e8701a'); g.fillStyle = r; g.fillRect(0, 0, W, H); g.strokeStyle = '#2a1407'; g.lineWidth = 5; for (let i = -128; i < 256; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke(); g.beginPath(); g.moveTo(i + 128, 0); g.lineTo(i, 128); g.stroke(); } g.lineWidth = 12; g.strokeRect(0, 0, W, H); });
  const glowT = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.3, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const cloudT = canvasTex(256, 128, (g) => { for (let i = 0; i < 22; i++) { const x = 30 + R() * 196, y = 44 + R() * 44, r = 16 + R() * 36; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128); } });

  const M = (base, rx, ry, o = {}) => { const t = base.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); if (o.rot) { t.center.set(.5, .5); t.rotation = o.rot; } return keep(new THREE.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: o.bump ?? 1.5, roughness: o.rough ?? .9, color: o.color ?? '#ffffff', side: o.side ?? THREE.FrontSide })); };
  const beamM = M(woodT, 1, 1, { color: '#5a3a26' });
  const plankM = M(woodT, 1, 1, { color: '#b07a4a' });
  const plasterM = M(plasterT, 2, 2, { bump: .6 });
  const winM = keep(new THREE.MeshBasicMaterial({ map: winT, toneMapped: false }));
  const darkWinM = keep(new THREE.MeshStandardMaterial({ color: '#141228', roughness: .3, metalness: .4 }));
  const ironM = keep(new THREE.MeshStandardMaterial({ color: '#15131c', metalness: .8, roughness: .5 }));
  const lampM = keep(new THREE.MeshBasicMaterial({ color: '#ffcf6a', toneMapped: false }));

  const B = (p, w, h, d, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(keep(new THREE.BoxGeometry(w, h, d)), m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); p.add(o); return o; };
  const glow = (p, color, s, op, pos) => { const sp = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: glowT, color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }))); sp.scale.set(s, s, 1); sp.position.copy(pos); p.add(sp); return sp; };
  const flickers = [];

  // Sky, stars, clouds
  const skyMat = keep(new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#05072e') }, mid: { value: new THREE.Color('#1e2fc4') }, hor: { value: new THREE.Color('#7a3fc0') } },
    vertexShader: 'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform vec3 top,mid,hor;varying vec3 vD;void main(){float h=vD.y;vec3 c=mix(hor,mid,smoothstep(-.02,.3,h));c=mix(c,top,smoothstep(.3,.95,h));gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}' }));
  scene.add(new THREE.Mesh(keep(new THREE.SphereGeometry(500, 32, 16)), skyMat));
  { const N = 2600, p = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const u = R() * 6.283, v = .04 + Math.pow(R(), .8) * .96; const r = Math.sqrt(1 - v * v); p.set([Math.cos(u) * r * 420, v * 420, Math.sin(u) * r * 420], i * 3); }
    const g = keep(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    scene.add(new THREE.Points(g, keep(new THREE.PointsMaterial({ map: glowT, color: '#ffffff', size: 2.4, sizeAttenuation: false, transparent: true, depthWrite: false, fog: false })))); }
  const clouds = [];
  for (const [x, y, z, s, c] of [[-70, 60, -200, 90, '#ff5a2a'], [40, 110, -230, 110, '#ff6a2a'], [110, 70, -190, 80, '#ff4a3a'], [-120, 120, -160, 100, '#ff7a3a'], [10, 170, -150, 90, '#ff5a2a'], [-30, 35, -240, 70, '#ff3a6a'], [160, 140, -120, 90, '#ff6a2a']]) {
    const sp = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: cloudT, color: c, transparent: true, opacity: .75, depthWrite: false, fog: false })));
    sp.scale.set(s, s * .5, 1); sp.position.set(x, y, z); sp.material.rotation = R() - .5; scene.add(sp); clouds.push([sp, x, .3 + R() * .5]); }

  scene.add(new THREE.HemisphereLight(0x7c8aff, 0x2a1838, 1.1));
  const moon = new THREE.DirectionalLight(0xa8b4ff, 1.5); moon.position.set(-20, 30, 18); scene.add(moon);
  const back = new THREE.DirectionalLight(0xff6a4a, .5); back.position.set(30, 20, -40); scene.add(back);
  const lamp = (p, pos, inten = 9, dist = 9) => { const l = new THREE.PointLight(0xff9a3a, inten, dist, 1.6); l.position.copy(pos); p.add(l); flickers.push([l, inten, R() * 9]); return l; };

  // Street
  { const g = keep(new THREE.PlaneGeometry(40, 70, 80, 140)); g.rotateX(-Math.PI / 2); g.translate(0, 0, -21);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, sy(z) - Math.abs(x) * .02 + Math.max(0, Math.abs(x) - 4) * .08); }
    g.computeVertexNormals(); scene.add(new THREE.Mesh(g, M(cobbleT, 12, 21, { bump: 3, rough: .75, color: '#c8b8d8' }))); }

  // Half-timbered house; local +z = front (gable), ridge along z
  const house = ({ x, z, ry = 0, y, w, d, base, up, roof, wins, chim, gwin = true }) => {
    const g = new THREE.Group(); g.position.set(x, y ?? sy(z) - .6, z); g.rotation.y = ry; scene.add(g);
    const H0 = base + (y == null ? .6 : 0), W1 = w + .3, D1 = d + .3, top = H0 + up, fz = D1 / 2 + .05;
    B(g, w, H0, d, M(stoneT, w / 2, H0 / 2), 0, H0 / 2, 0);
    B(g, W1, up, D1, plasterM, 0, H0 + up / 2, 0);
    for (const sx of [-1, 1]) { B(g, .2, up + .1, .2, beamM, sx * (W1 / 2 - .05), H0 + up / 2, fz - .07); B(g, .2, up + .1, .2, beamM, sx * (W1 / 2 - .05), H0 + up / 2, -fz + .07); B(g, .16, up, .14, beamM, sx * W1 / 6, H0 + up / 2, fz);
      const bw = W1 / 3, L = Math.hypot(bw, up), a = Math.atan2(up, bw); B(g, L, .13, .12, beamM, sx * W1 / 3, H0 + up / 2, fz, 0, 0, sx * a);
      B(g, .14, .14, D1, beamM, sx * (W1 / 2 + .03), H0 + .07, 0); B(g, .14, .14, D1, beamM, sx * (W1 / 2 + .03), top - .07, 0); B(g, .14, up, .14, beamM, sx * (W1 / 2 + .03), H0 + up / 2, 0); }
    B(g, W1 + .2, .18, .18, beamM, 0, H0 + .09, fz); B(g, W1 + .2, .18, .18, beamM, 0, top - .09, fz);
    for (const [wx, wy, ww, wh, lit = true, face = 0] of wins ?? [[-W1 / 4, H0 + up * .5, .9, 1.1], [W1 / 4, H0 + up * .5, .9, 1.1, R() < .7]]) {
      const fg = new THREE.Group(); if (face) { fg.rotation.y = face * Math.PI / 2; } g.add(fg); const zz = face ? W1 / 2 + .06 : fz + .01;
      const pl = new THREE.Mesh(keep(new THREE.PlaneGeometry(ww, wh)), lit ? winM : darkWinM); pl.position.set(wx, wy, zz); fg.add(pl);
      B(fg, ww + .24, .14, .14, beamM, wx, wy + wh / 2 + .05, zz + .03); B(fg, ww + .34, .14, .24, beamM, wx, wy - wh / 2 - .05, zz + .06);
      B(fg, .12, wh, .12, beamM, wx - ww / 2 - .04, wy, zz + .03); B(fg, .12, wh, .12, beamM, wx + ww / 2 + .04, wy, zz + .03);
      if (lit) glow(fg, '#ff9a3a', Math.max(ww, wh) * 2.6, .45, V(wx, wy, zz + .25)); }
    const hw = W1 / 2 + .45, a = Math.atan2(roof, hw), L = Math.hypot(hw, roof) + .25, slate = M(slateT, L / 1.4, (D1 + 1) / 1.4, { rot: Math.PI / 2, bump: 2.5, rough: .8, color: '#9fb6a8' });
    for (const sx of [-1, 1]) B(g, L, .22, D1 + 1, slate, sx * hw / 2, top + roof / 2 + .05, 0, 0, 0, -sx * a);
    const sh = new THREE.Shape([new THREE.Vector2(-W1 / 2, 0), new THREE.Vector2(W1 / 2, 0), new THREE.Vector2(0, roof * (W1 / 2) / hw)]);
    const tri = keep(new THREE.ExtrudeGeometry(sh, { depth: .1, bevelEnabled: false }));
    for (const sz of [-1, 1]) { const m = new THREE.Mesh(tri, plasterM); m.position.set(0, top, sz * (D1 / 2) - (sz < 0 ? 0 : .1)); g.add(m); }
    const gh = roof * (W1 / 2) / hw; B(g, .16, gh, .14, beamM, 0, top + gh / 2, fz);
    for (const sx of [-1, 1]) B(g, Math.hypot(W1 / 2, gh), .14, .14, beamM, sx * W1 / 4, top + gh / 2, fz, 0, 0, -sx * Math.atan2(gh, W1 / 2));
    if (gwin) { const pl = new THREE.Mesh(keep(new THREE.PlaneGeometry(.55, .55)), winM); pl.position.set(0, top + gh * .38, fz + .02); g.add(pl); glow(g, '#ff9a3a', 1.6, .4, V(0, top + gh * .38, fz + .3)); }
    if (chim) { const ch = top + roof + 1; B(g, .9, ch - top + .2, .9, M(stoneT, .8, 2), chim[0], top + (ch - top) / 2, chim[1]); B(g, 1.1, .2, 1.1, M(stoneT, 1, .3), chim[0], ch + .1, chim[1]); }
    return { g, H0, top, fz, W1 };
  };

  // Close left house, then the street climbing
  house({ x: -7.2, z: 4, ry: Math.PI / 2, w: 9, d: 5, base: 2.6, up: 4.2, roof: 3.6, wins: [[-2.4, 5.4, 1.1, 1.5, true], [1.8, 5.4, 1.1, 1.5, false], [2, 1.6, .9, 1.1, true]] });
  house({ x: -7, z: -8, ry: Math.PI / 2 + .12, w: 7, d: 5, base: 2.4, up: 3.4, roof: 3, chim: [1.2, -1] });
  house({ x: -6.2, z: -18, ry: Math.PI / 2 + .3, w: 6, d: 4.5, base: 2.2, up: 3, roof: 2.8 });
  house({ x: 3.8, z: -22, ry: -Math.PI / 2 + .2, w: 5, d: 4, base: 2, up: 2.6, roof: 2.4 });

  // Tavern on its stone terrace
  { const tz = -8, ty = sy(tz) + 1.6, w = 6.2, d = 7;
    const t = house({ x: 8.2, z: tz, ry: -.45, y: ty, w, d, base: 3, up: 3.2, roof: 3.2, chim: [1.6, -2], wins: [[-1.55, 4.7, 1.1, 1.3], [1.55, 4.7, 1.1, 1.3], [1.6, 1.7, 1.1, 1.2], [0, 4.7, 1.1, 1.3, true, 1], [-2, 1.8, 1, 1.1, true, -1]] });
    const g = t.g, dx = -1.4;
    B(g, w + 1.4, 3.6, d + 1.4, M(stoneT, 3, 1.8), 0, -1.8, 0);
    B(g, 1.15, 2.1, .12, plankM, dx, 1.05, d / 2 + .02); B(g, 1.45, .2, .2, beamM, dx, 2.2, d / 2 + .1);
    const dg = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.1, .08)), lampM); dg.position.set(dx, .05, d / 2 + .1); g.add(dg);
    for (const sx of [-1, 1]) { const p = V(dx + sx * .95, 2.3, d / 2 + .35); B(g, .05, .05, .4, ironM, p.x, p.y + .2, d / 2 + .2); B(g, .22, .3, .22, lampM, p.x, p.y, p.z); glow(g, '#ffb04a', 1.8, .8, p); }
    lamp(g, V(dx, 2.6, d / 2 + 1.2), 12, 10);
    for (let i = 0; i < 9; i++) { B(g, 1.5, .1, .42, plankM, dx, -.05 - i * .2, d / 2 + .9 + i * .36); }
    for (const sx of [-1, 1]) { const x = dx + sx * .82, L = Math.hypot(9 * .36, 1.8), a = Math.atan2(1.8, 9 * .36);
      B(g, .12, .3, L, beamM, x, -.95, d / 2 + .9 + 4 * .36, -a); B(g, .09, .09, L, beamM, x, -.95 + 1, d / 2 + .9 + 4 * .36, -a);
      for (let i = 0; i < 4; i++) B(g, .1, 1.1, .1, beamM, x, -.4 - i * .55 + .1, d / 2 + .9 + i * 1.1); }
    // Hanging sign
    const sg = new THREE.Group(); sg.position.set(dx - 2.1, 3.25, d / 2 + .9); g.add(sg);
    B(g, .16, .16, 1.9, beamM, dx - 2.1, 3.65, d / 2 + .15);
    const signT = canvasTex(512, 160, () => {}); signT.wrapS = signT.wrapT = THREE.ClampToEdgeWrapping;
    const drawSign = () => { const c = signT.image, x = c.getContext('2d'); x.fillStyle = '#7a4a26'; x.fillRect(0, 0, 512, 160); x.strokeStyle = '#3a200e'; x.lineWidth = 14; x.strokeRect(7, 7, 498, 146); x.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 5; i++) x.fillRect(0, 30 * i + 12, 512, 2); x.font = '700 96px "Grenze Gotisch", serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#2a1608'; x.fillText('Taverne', 259, 86); x.fillStyle = '#ffd36a'; x.fillText('Taverne', 256, 82); signT.needsUpdate = true; };
    drawSign(); if (document.fonts) document.fonts.load('700 96px "Grenze Gotisch"').then(drawSign).catch(() => {});
    const face = keep(new THREE.MeshStandardMaterial({ map: signT, roughness: .7 }));
    const board = new THREE.Mesh(keep(new THREE.BoxGeometry(.1, .78, 2.5)), [plankM, plankM, plankM, plankM, plankM, plankM]); sg.add(board);
    for (const s of [1, -1]) { const p = new THREE.Mesh(keep(new THREE.PlaneGeometry(2.4, .72)), face); p.position.x = s * .056; p.rotation.y = s * Math.PI / 2; sg.add(p); }
    for (const sz of [-.9, .9]) B(sg, .03, .5, .03, ironM, 0, .6, sz);
    sg.rotation.y = .1; g.userData.sign = sg;
    for (const [bx, bz] of [[1.4, d / 2 + .7], [2.2, d / 2 + .6]]) { const br = new THREE.Mesh(keep(new THREE.CylinderGeometry(.38, .38, .9, 14)), plankM); br.position.set(bx, .45, bz); g.add(br); B(g, .8, .05, .05, ironM, bx, .7, bz + .36); }
    scene.userData.sign = sg; }

  // Curved retaining wall, right foreground
  { const cx = 11, cz = 4, r = 7, h = 4;
    const m = new THREE.Mesh(keep(new THREE.CylinderGeometry(r, r, h, 40, 1, true, 3 * Math.PI / 2 - .95, 1.9)), M(stoneT, 5, 1.6, { side: THREE.DoubleSide, bump: 3, color: '#b0a8c4' }));
    m.position.set(cx, sy(cz) + h / 2 - .4, cz); m.rotation.x = -.04; scene.add(m);
    const cap = new THREE.Mesh(keep(new THREE.CylinderGeometry(r + .15, r + .15, .35, 40, 1, true, 3 * Math.PI / 2 - .95, 1.9)), keep(new THREE.MeshStandardMaterial({ color: '#2c4a36', roughness: 1, side: THREE.DoubleSide })));
    cap.position.set(cx, sy(cz) + h - .45, cz); scene.add(cap); }

  // Tower
  { const tx = 7.5, tz = -27, g = new THREE.Group(); g.position.set(tx, sy(tz) - 1, tz); scene.add(g);
    const st = new THREE.Mesh(keep(new THREE.CylinderGeometry(2.5, 3.4, 20, 4, 1)), M(stoneT, 6, 9, { bump: 2.5, color: '#c4bcd8' })); st.rotation.y = Math.PI / 4; st.position.y = 10; g.add(st);
    B(g, 5.4, .5, 5.4, beamM, 0, 20.1, 0);
    for (let i = -2; i <= 2; i++) for (const s of [1, -1]) { B(g, .25, .6, 1.2, beamM, i * 1.1, 19.7, s * 2.7, -s * .5); }
    const top = new THREE.Group(); top.position.y = 22.2; g.add(top);
    B(top, 5.6, 3.8, 5.6, plasterM, 0, 0, 0);
    for (let k = 0; k < 4; k++) { const f = new THREE.Group(); f.rotation.y = k * Math.PI / 2; top.add(f);
      for (const sx of [-2.75, 0, 2.75]) B(f, .2, 3.9, .2, beamM, sx, 0, 2.85);
      B(f, 5.8, .2, .2, beamM, 0, -1.85, 2.85); B(f, 5.8, .2, .2, beamM, 0, 1.85, 2.85);
      for (const sx of [-1, 1]) B(f, 3.1, .16, .14, beamM, sx * 1.37, -.1, 2.88, 0, 0, sx * .9);
      const lit = k !== 2, pl = new THREE.Mesh(keep(new THREE.PlaneGeometry(1, 1.1)), lit ? winM : darkWinM); pl.position.set(-1.35, .3, 2.86); f.add(pl); if (lit) glow(f, '#ff9a3a', 3, .45, V(-1.35, .3, 3.1)); }
    lamp(top, V(-3, 0, 3.5), 14, 12);
    const rf = new THREE.Mesh(keep(new THREE.ConeGeometry(4.7, 9.5, 4, 1)), M(slateT, 5, 7, { bump: 2.5, rough: .8, color: '#9fb6a8' })); rf.rotation.y = Math.PI / 4; rf.position.y = 6.6; top.add(rf);
    const pole = new THREE.Mesh(keep(new THREE.CylinderGeometry(.06, .06, 2.4, 6)), ironM); pole.position.y = 12.3; top.add(pole);
    const fg = keep(new THREE.PlaneGeometry(2.2, .9, 14, 4)); fg.translate(1.1, 0, 0);
    const flag = new THREE.Mesh(fg, keep(new THREE.MeshStandardMaterial({ color: '#ff2a1a', emissive: '#8a0a00', emissiveIntensity: .6, side: THREE.DoubleSide, roughness: .7 }))); flag.position.y = 13.05; top.add(flag);
    scene.userData.flag = [fg, Float32Array.from(fg.attributes.position.array)];
    // Mid-tower bay with a lit window
    const bay = new THREE.Group(); bay.position.set(-2.1, 12.5, 1.4); bay.rotation.y = -Math.PI / 4; g.add(bay);
    B(bay, 2.2, 2, 1.4, plasterM, 0, 0, 0); for (const sx of [-1.05, 1.05]) B(bay, .16, 2.05, .16, beamM, sx, 0, .72);
    const bw = new THREE.Mesh(keep(new THREE.PlaneGeometry(.8, .9)), winM); bw.position.set(0, 0, .71); bay.add(bw); glow(bay, '#ff9a3a', 2.4, .5, V(0, 0, 1));
    for (const sx of [-1, 1]) B(bay, 1.6, .16, 1.9, M(slateT, 1, 1, { color: '#9fb6a8' }), sx * .55, 1.35, 0, 0, 0, -sx * .7);
    const dr = new THREE.Mesh(keep(new THREE.PlaneGeometry(1, 1.8)), winM); dr.position.set(-2.3, 1.9 + .9, 2.3); dr.rotation.y = -Math.PI / 4; g.add(dr); glow(g, '#ffa04a', 3, .5, V(-2.5, 2.8, 2.6)); }

  // Trees
  const leafM = keep(new THREE.MeshStandardMaterial({ color: '#1f4a3a', roughness: .9, flatShading: true }));
  for (const [x, z, s] of [[-1.5, -31, 1.4], [12.5, -21, 1.1], [-10, -25, 1.6], [2, -36, 1.2]]) { const g = new THREE.Group(); g.position.set(x, sy(z), z); g.scale.setScalar(s); scene.add(g);
    const tr = new THREE.Mesh(keep(new THREE.CylinderGeometry(.18, .3, 3, 6)), beamM); tr.position.y = 1.5; g.add(tr);
    for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(keep(new THREE.IcosahedronGeometry(1 + R() * .6, 0)), leafM); b.position.set((R() - .5) * 2, 3.2 + R() * 1.6, (R() - .5) * 2); g.add(b); } }

  lamp(scene, V(-3.8, 4.5, 2), 8, 9);
  const lpos = V(-4.5, 3.4, 1.5); B(scene, .26, .34, .26, lampM, lpos.x, lpos.y, lpos.z); B(scene, .9, .06, .06, ironM, -4.9, 3.8, 1.5); glow(scene, '#ffb04a', 2.2, .8, lpos);

  // Embers
  const EN = 160, eBase = [], ePos = new Float32Array(EN * 3);
  for (let i = 0; i < EN; i++) eBase.push([(R() - .5) * 18 + 2, R() * 12, -R() * 26 + 6, R() * 6.28, .2 + R() * .5]);
  const eGeo = keep(new THREE.BufferGeometry()); eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  scene.add(new THREE.Points(eGeo, keep(new THREE.PointsMaterial({ map: glowT, color: '#ff9a4a', size: .22, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))));
  const placeEmbers = t => { for (let i = 0; i < EN; i++) { const [x, y, z, p, sp] = eBase[i]; ePos[i * 3] = x + Math.sin(t * sp + p) * .8; ePos[i * 3 + 1] = sy(z) + .3 + ((y + t * sp * .6) % 12); ePos[i * 3 + 2] = z + Math.cos(t * sp * .7 + p) * .6; } eGeo.attributes.position.needsUpdate = true; };

  // Camera + loop
  const camBase = V(-.6, 1.5, 11), look = V(3, 7.5, -20);
  let px = 0, py = 0, tx = 0, ty = 0;
  const onMove = e => { tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; };
  addEventListener('pointermove', onMove, { passive: true });
  const resize = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1, a = w / h; renderer.setSize(w, h, false); camera.aspect = a;
    if (a < .8) { camera.fov = 74; camBase.set(1.8, 1.4, 11); look.set(5.5, 10, -20); } else if (a < 1.3) { camera.fov = 64; camBase.set(.6, 1.5, 11); look.set(4.5, 8.5, -20); } else { camera.fov = 54; camBase.set(-.6, 1.5, 11); look.set(2.4, 7.2, -20); }
    camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  let visible = true; const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(el);
  const [flagGeo, flagBase] = scene.userData.flag, sign = scene.userData.sign;
  const animate = t => {
    const fp = flagGeo.attributes.position; for (let i = 0; i < fp.count; i++) { const x = flagBase[i * 3]; fp.setZ(i, Math.sin(x * 2.6 - t * 5) * .18 * (x / 2.2)); fp.setY(i, flagBase[i * 3 + 1] - Math.sin(x * 1.5 - t * 3) * .05 * x); } fp.needsUpdate = true;
    for (const [l, b, ph] of flickers) l.intensity = b * (.85 + Math.sin(t * 9 + ph) * .06 + Math.sin(t * 23 + ph * 2) * .05);
    for (const [c, x0, sp] of clouds) c.position.x = x0 + Math.sin(t * .02 * sp) * 20;
    sign.rotation.z = Math.sin(t * .9) * .04;
    placeEmbers(t); };
  let raf = 0, t = 0, last = performance.now();
  const frame = now => { raf = requestAnimationFrame(frame); if (document.hidden || !visible) { last = now; return; }
    t += Math.min(.05, (now - last) / 1000); last = now;
    px += (tx - px) * .04; py += (ty - py) * .04;
    camera.position.set(camBase.x + px * .5 + Math.sin(t * .1) * .2, camBase.y - py * .25 + Math.sin(t * .15) * .06, camBase.z);
    camera.lookAt(look); animate(t); renderer.render(scene, camera); };
  if (reduce) { animate(0); camera.position.copy(camBase); camera.lookAt(look); renderer.render(scene, camera); } else raf = requestAnimationFrame(frame);

  return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); removeEventListener('pointermove', onMove); disposables.forEach(d => d.dispose && d.dispose()); renderer.dispose(); renderer.domElement.remove(); };
}
