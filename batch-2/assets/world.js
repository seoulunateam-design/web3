/* SEOULUNA — collection "dream worlds".
   One data-driven theme table (WORLDS) drives everything: the colour tokens (CSS custom
   properties on <html>, animated via @property), the generated cloud + particle scene,
   and the product entrance style. World.set(key) is the single state change. */

const WORLDS = {
  pop: {
    enter: 'rise',
    vars: {
      bg1: '#FFF1F7', bg2: '#F8D5E8', bg3: '#E4D3F8',
      glow1: 'rgba(255,160,205,.60)', glow2: 'rgba(190,160,248,.50)', sweep: 'rgba(255,255,255,.55)',
      accent: '#D26AA6', ink: '#3E2B40', 'ink-soft': '#5B4560',
      'panel-1': '#C98BB9', 'panel-2': '#7B4A7D', 'panel-ink': '#FFF9F5', outline: 'rgba(255,236,246,.85)',
      'pill': 'rgba(255,255,255,.85)', 'pill-ink': '#51334F', 'pill-on': '#51334F', 'pill-on-ink': '#FFF9F5',
      btn: '#51334F', 'btn-ink': '#FFF9F5', strip: '#5E3A5E', halo: 'rgba(255,170,215,.65)', shade: 'rgba(81,51,79,.32)',
    },
    clouds: [
      { zone: 'back', h: 230, bottom: 70, v: 7,  op: .55, top: '#F3E6FC', bot: '#DCC8F5', puffs: 9 },
      { zone: 'back', h: 190, y: 40,       v: 5,  op: .38, top: '#FFFFFF', bot: '#F4D9EC', puffs: 8, dir: -1, flip: true },
      { zone: 'mid',  h: 210, bottom: 0,  v: 14, op: .92, top: '#FFEAF4', bot: '#F7BEDB', puffs: 10 },
      { zone: 'mid',  h: 150, bottom: -42, v: 26, op: .95, top: '#FFFFFF', bot: '#FBD7E8', puffs: 9, dir: -1 },
    ],
    particles: [
      { type: 'orb',   n: 4, size: [90, 190], op: [.3, .5],  layer: 'back' },
      { type: 'heart', n: 7, size: [12, 26],  op: [.55, .9], layer: 'mid' },
      { type: 'moon',  n: 3, size: [26, 46],  op: [.55, .85], layer: 'mid' },
      { type: 'dust',  n: 12, size: [3, 5],   op: [.6, 1],   layer: 'mid' },
      { type: 'spark', n: 10, size: [9, 20],  op: [.6, 1],   layer: 'fore' },
    ],
    pearl: ['#FFF5F9', '#F6D2E4', '#D99BBE'], particle: '#FFFFFF', glowDot: 'rgba(255,170,215,.9)',
  },

  street: {
    enter: 'emerge',
    vars: {
      bg1: '#120E17', bg2: '#241A2E', bg3: '#3B2749',
      glow1: 'rgba(146,104,206,.38)', glow2: 'rgba(196,206,235,.16)', sweep: 'rgba(214,220,240,.16)',
      accent: '#C9CFE2', ink: '#F5F0F8', 'ink-soft': '#C8BCD3',
      'panel-1': '#40344F', 'panel-2': '#141018', 'panel-ink': '#F1ECF5', outline: 'rgba(201,207,226,.7)',
      'pill': 'rgba(28,22,36,.72)', 'pill-ink': '#E9E2EF', 'pill-on': '#E9E2EF', 'pill-on-ink': '#1B1620',
      btn: '#E9E2EF', 'btn-ink': '#1B1620', strip: '#0E0B12', halo: 'rgba(150,120,215,.45)', shade: 'rgba(0,0,0,.6)',
    },
    clouds: [
      { zone: 'back', h: 240, bottom: 60, v: 4,  op: .75, top: '#46345A', bot: '#2A2036', puffs: 9 },
      { zone: 'back', h: 170, y: 30,      v: 3,  op: .35, top: '#4B3862', bot: '#2A2036', puffs: 7, dir: -1, flip: true },
      { zone: 'mid',  h: 200, bottom: 0,  v: 9,  op: .95, top: '#3A2B4A', bot: '#150F1B', puffs: 10 },
      { zone: 'mid',  h: 140, bottom: -44, v: 17, op: .98, top: '#2B2038', bot: '#0E0A12', puffs: 9, dir: -1 },
    ],
    particles: [
      { type: 'orb',  n: 3, size: [120, 240], op: [.25, .45], layer: 'back' },
      { type: 'dust', n: 16, size: [2, 4],    op: [.35, .85], layer: 'mid' },
      { type: 'moon',  n: 3, size: [30, 58],  op: [.45, .8],  layer: 'mid' },
      { type: 'spark', n: 9, size: [8, 16],   op: [.5, .9],   layer: 'fore' },
    ],
    pearl: ['#F2F4FA', '#B4B9CE', '#5E5877'], particle: '#D9DEEE', glowDot: 'rgba(150,120,215,.9)',
  },

  gold: {
    enter: 'glow',
    vars: {
      bg1: '#FFF9EE', bg2: '#F7E8C8', bg3: '#EADCEF',
      glow1: 'rgba(255,212,130,.65)', glow2: 'rgba(212,190,240,.42)', sweep: 'rgba(255,226,160,.6)',
      accent: '#B8872A', ink: '#2A2015', 'ink-soft': '#6A5844',
      'panel-1': '#E6C46A', 'panel-2': '#B8872A', 'panel-ink': '#FFF9EE', outline: 'rgba(255,249,238,.85)',
      'pill': 'rgba(255,252,244,.86)', 'pill-ink': '#2F2416', 'pill-on': '#2F2416', 'pill-on-ink': '#FFF9EE',
      btn: '#2F2416', 'btn-ink': '#FFF9EE', strip: '#2F2416', halo: 'rgba(255,208,120,.7)', shade: 'rgba(110,80,30,.32)',
    },
    clouds: [
      { zone: 'back', h: 230, bottom: 70, v: 7,  op: .6,  top: '#FFF6E2', bot: '#EBD6AE', puffs: 9 },
      { zone: 'back', h: 190, y: 40,      v: 5,  op: .4,  top: '#FFFFFF', bot: '#EDDDF4', puffs: 8, dir: -1, flip: true },
      { zone: 'mid',  h: 210, bottom: 0,  v: 13, op: .94, top: '#FFFBEF', bot: '#F2DDB0', puffs: 10 },
      { zone: 'mid',  h: 150, bottom: -42, v: 24, op: .96, top: '#FFFFFF', bot: '#F8EBCB', puffs: 9, dir: -1 },
    ],
    particles: [
      { type: 'orb',    n: 6, size: [80, 180], op: [.4, .65], layer: 'back' },
      { type: 'dust',   n: 14, size: [3, 6],   op: [.6, 1],   layer: 'mid' },
      { type: 'moon',   n: 3, size: [28, 52],  op: [.5, .85],  layer: 'mid' },
      { type: 'spark',  n: 10, size: [9, 20],  op: [.65, 1],  layer: 'fore' },
    ],
    pearl: ['#FFFBEF', '#F6E2B6', '#D2AC62'], particle: '#E8BE62', glowDot: 'rgba(240,196,110,.95)',
  },
};

const World = (() => {
  const root = document.documentElement;
  const hero = document.getElementById('home');
  const stage = hero && hero.querySelector('.world');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = null;
  let uid = 0;

  /* small deterministic RNG so each world always lays out the same way */
  const rng = seed => () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const between = (r, [a, b]) => a + (b - a) * r();
  const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

  /* One cloud bank: overlapping circles on a flat base, drawn wide enough to tile seamlessly */
  function cloudRow(row, r, id) {
    const W = 1200, H = 220, base = 150, circles = [];
    for (let i = 0; i < row.puffs; i++) {
      const rad = 46 + r() * 54;
      const x = (i + .2 + r() * .6) * (W / row.puffs);
      const y = base - rad * (.35 + r() * .5);
      circles.push([x, y, rad]);
      if (x - rad < 0) circles.push([x + W, y, rad]);
      if (x + rad > W) circles.push([x - W, y, rad]);
    }
    const shape = circles.map(([x, y, rad]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}"/>`).join('')
      + `<rect x="-10" y="${base - 30}" width="${W + 20}" height="${H - base + 40}"/>`;
    const svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"${row.flip ? ' style="transform:scaleX(-1)"' : ''}>
      <defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${base - 120}" x2="0" y2="${H}">
        <stop offset="0" stop-color="${row.top}"/><stop offset="1" stop-color="${row.bot}"/></linearGradient></defs>
      <g fill="url(#${id})">${shape}</g></svg>`;
    const tile = row.h * W / H;
    const dur = tile / row.v;
    const pos = row.bottom !== undefined ? `bottom:${row.bottom}px` : `top:${row.y || 0}px`;
    return `<div class="w-cloud w-cloud--${row.zone}" style="${pos};height:${row.h}px;opacity:${row.op};">
      <div class="w-track" style="--tile:${tile.toFixed(0)}px;--dur:${dur.toFixed(1)}s;animation-direction:${row.dir === -1 ? 'reverse' : 'normal'}">${svg.repeat(4)}</div></div>`;
  }

  function particle(p, r, w) {
    const s = between(r, p.size).toFixed(1);
    const x = (r() * 100).toFixed(1);
    const y = (p.type === 'orb' ? r() * 90 : r() * 96).toFixed(1);
    const dur = (p.type === 'dust' ? 14 + r() * 14 : 9 + r() * 12).toFixed(1);
    const drift = p.type === 'dust' ? 28 : 22;
    const style = `left:${x}%;top:${y}%;--s:${s}px;--o:${between(r, p.op).toFixed(2)};--d:${dur}s;--dl:${(-r() * dur).toFixed(1)}s;`
      + `--dx:${((r() - .5) * 2 * drift).toFixed(0)}px;--dy:${(-8 - r() * drift * 1.3).toFixed(0)}px;--tw:${(2.6 + r() * 3).toFixed(1)}s`;
    const inner = p.type === 'spark' ? '<svg viewBox="0 0 100 100"><use href="#spark"/></svg>'
      : p.type === 'moon' ? '<svg viewBox="0 0 100 100"><use href="#crescent"/></svg>'
      : p.type === 'heart' ? '<svg viewBox="0 0 24 24"><use href="#heart"/></svg>' : '';
    return `<i class="pt pt--${p.type}" style="${style}">${inner}</i>`;
  }

  const scenes = {};
  let depthEls = [];

  function buildScene(key) {
    const w = WORLDS[key];
    const r = rng(hash(key));
    const k = innerWidth < 860 ? .55 : 1;
    const id = `wc${++uid}`;
    const scene = document.createElement('div');
    scene.className = 'w-scene idle';
    scene.dataset.world = key;
    const [pm, pe, pd] = w.pearl;
    const v = w.vars;
    scene.style.cssText = `--pt:${w.particle};--pt-glow:${w.glowDot};--pearl-1:${pm};--pearl-2:${pe};--pearl-3:${pd};`
      + `--bg1:${v.bg1};--bg2:${v.bg2};--bg3:${v.bg3};--glow1:${v.glow1};--glow2:${v.glow2};--sweep:${v.sweep}`;
    const back = ['<div class="w-bg"></div><div class="w-glow w-glow--a"></div><div class="w-glow w-glow--b"></div><div class="w-sweep"></div>'];
    const mid = [], fore = [];
    w.clouds.forEach((row, i) => (row.zone === 'back' ? back : mid).push(cloudRow(row, r, `${id}-${i}`)));
    w.particles.forEach(p => {
      const n = Math.max(1, Math.round(p.n * k));
      for (let i = 0; i < n; i++) (p.layer === 'back' ? back : p.layer === 'fore' ? fore : mid).push(particle(p, r, w));
    });
    scene.innerHTML = `<div class="w-layer w-layer--back" data-depth="7">${back.join('')}</div>
      <div class="w-layer w-layer--mid" data-depth="16">${mid.join('')}</div>
      <div class="w-layer w-layer--fore" data-depth="30">${fore.join('')}</div>`;
    stage.appendChild(scene);
    depthEls = [...stage.querySelectorAll('[data-depth]')];
    return scene;
  }

  /* every world is built once (the others while the browser is idle), so switching never builds DOM mid-animation */
  const ensure = key => scenes[key] || (scenes[key] = buildScene(key));

  function set(key, instant) {
    const w = WORLDS[key];
    if (!w || key === current || !stage) return;
    const prev = scenes[current];
    current = key;
    /* panel: keep showing the old gradient underneath while the new one fades in on its ::before */
    const was = prev && WORLDS[prev.dataset.world].vars;
    const panel = hero.querySelector('.hero__panel');
    const from = was || w.vars;
    root.style.setProperty('--w-panel-p1', from['panel-1']);
    root.style.setProperty('--w-panel-p2', from['panel-2']);
    Object.entries(w.vars).forEach(([name, v]) => root.style.setProperty(`--w-${name}`, v));
    if (was && !instant && !calm && panel.animate) {
      try { panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: 'ease', pseudoElement: '::before' }); } catch (e) {}
    }
    root.dataset.world = key;
    hero.dataset.enter = w.enter;
    const next = ensure(key);
    clearTimeout(next._idle);
    next.classList.remove('idle');
    if (instant || calm) next.classList.add('instant');
    next.classList.add('on');
    if (prev) {
      prev.classList.remove('on');
      prev._idle = setTimeout(() => prev.classList.add('idle'), 1100);
    }
  }

  /* Layered pointer parallax: one pair of CSS variables, smoothed in a single rAF loop */
  function parallax() {
    if (calm || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, live = true;
    const cups = [...hero.querySelectorAll('.hero__cup')];
    const tick = () => {
      x += (tx - x) * .08; y += (ty - y) * .08;
      depthEls.forEach(el => { const d = +el.dataset.depth; el.style.translate = `${(-x * d).toFixed(2)}px ${(-y * d * .6).toFixed(2)}px`; });
      cups.forEach(p => { p.style.rotate = `${(x * 1.2).toFixed(2)}deg`; });
      raf = (Math.abs(tx - x) + Math.abs(ty - y) > .002 && live) ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf && live) raf = requestAnimationFrame(tick); };
    hero.addEventListener('pointermove', e => {
      const b = hero.getBoundingClientRect();
      tx = ((e.clientX - b.left) / b.width - .5) * 2;
      ty = ((e.clientY - b.top) / b.height - .5) * 2;
      kick();
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { tx = ty = 0; kick(); });
    new IntersectionObserver(([en]) => { live = en.isIntersecting; }).observe(hero);
  }

  /* Pause every ambient loop while the hero is off-screen */
  function pauseOffscreen() {
    new IntersectionObserver(([en]) => hero.classList.toggle('is-paused', !en.isIntersecting), { rootMargin: '80px' }).observe(hero);
  }

  if (hero && stage) {
    stage.innerHTML = '<div class="w-fade"></div>';
    set((window.COLL && window.COLL[0] && window.COLL[0].world) || 'pop', true);
    parallax();
    pauseOffscreen();
    const idle = window.requestIdleCallback || (f => setTimeout(f, 1200));
    idle(() => {
      Object.keys(WORLDS).forEach(ensure);
      /* warm the other products (and the product videos) so a switch never waits on the network */
      (window.COLL || []).forEach(c => { if (c.img) new Image().src = c.img; });
      const vid = document.getElementById('heroVideo');
      const gold = (window.COLL || []).find(c => c.video);
      if (vid && gold && !vid.getAttribute('src')) vid.src = gold.video;
    });
  }

  return { set, WORLDS };
})();
window.World = World;
