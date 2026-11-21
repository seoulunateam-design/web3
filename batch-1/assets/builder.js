/* SEOULUNA "Build Your Own Box". Catalogue comes from Liquid (snippets/builder-data.liquid);
   price and stock are Shopify's. The cart line is ONE box variant plus line item properties. */
(() => {
  'use strict';
  const root = document.querySelector('[data-byob]');
  if (!root) return;
  const $ = (s, el = root) => el.querySelector(s);
  const T = window.theme || { strings: {} };

  const readJSON = (el, fallback) => { try { return JSON.parse(el.textContent); } catch { return fallback; } };
  const data = readJSON($('[data-byob-data]'), { boxes: [], categories: [], designs: [], placeholder: '' });
  const S = readJSON($('[data-byob-strings]'), {});

  /* The six required categories. Labels / slot positions can be overridden by the byob_category metaobjects. */
  const BASE = [
    { key: 'chain', label: 'Chain', prop: 'Chain', slot: { x: 8, y: 44, w: 26, h: 24 } },
    { key: 'anklet', label: 'Anklet', prop: 'Anklet', slot: { x: 37, y: 44, w: 26, h: 24 } },
    { key: 'bracelet', label: 'Bracelet', prop: 'Bracelet', slot: { x: 66, y: 44, w: 26, h: 24 } },
    { key: 'earrings', label: 'Earrings', prop: 'Earrings', slot: { x: 8, y: 70, w: 26, h: 24 } },
    { key: 'scrunchie', label: 'Scrunchie', prop: 'Scrunchie color', slot: { x: 37, y: 70, w: 26, h: 24 } },
    { key: 'ring', label: 'Ring', prop: 'Ring', slot: { x: 66, y: 70, w: 26, h: 24 } },
    { key: 'hairclip', label: 'Hair clip', prop: 'Hair clip', optional: true, slot: { x: 37, y: 20, w: 26, h: 24 } },
  ];
  const cats = BASE.map(b => {
    const o = data.categories.find(c => c.key === b.key) || {};
    return { ...b, label: o.label || b.label, icon: o.icon || null, slot: { ...b.slot, ...(o.slot || {}) } };
  });
  const byOrder = (a, b) => (a.order || 0) - (b.order || 0);
  const boxes = data.boxes.slice().sort(byOrder);
  let designs = data.designs.slice().sort(byOrder);

  const tray = data.source === 'bundled';
  const preview = !!S.previewOnly;
  if (tray) root.classList.add('is-tray');
  if (tray) { const fr = $('[data-stage-frame]'); const ld = $('[data-lid]'); if (fr && ld) fr.append(ld); } /* stage-lid-moved */
  if (preview) root.classList.add('is-preview');

  const state = { boxId: null, picks: {}, name: '', open: null, busy: false };
  const firstBox = boxes.find(b => b.available);
  state.boxId = firstBox ? firstBox.id : null;

  const el = {
    boxes: $('[data-boxes]'), cats: $('[data-cats]'), designs: $('[data-designs]'),
    slots: $('[data-stage-slots]'), stageBox: $('[data-stage-box]'), lidImg: $('[data-lid-img]'),
    lidText: $('[data-lid-text]'), lid: $('[data-lid]'), name: $('[data-name]'), count: $('[data-name-count]'),
    price: $('[data-price]'), add: $('[data-add]'), msg: $('[data-msg]'), dots: $('[data-dots]'),
    progress: $('[data-progress-text]'), note: $('[data-stage-note]'),
  };

  const h = (tag, attrs = {}, kids = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'text') n.textContent = v; else n.setAttribute(k, v === true ? '' : v);
    }
    kids.forEach(c => c && n.append(c));
    return n;
  };
  const getBox = () => boxes.find(b => b.id === state.boxId);
  const getDesign = key => designs.find(d => d.id === state.picks[key]);
  const catDesigns = key => designs.filter(d => d.cat === key);
  const required = cats.filter(c => !c.optional); /* the six pieces every box needs; hair clip is an optional extra */
  const chosenCount = () => required.filter(c => getDesign(c.key)).length;

  /* ---------- Step 1: boxes ---------- */
  function renderBoxes() {
    el.boxes.replaceChildren();
    if (!boxes.length) { el.boxes.append(h('p', { class: 'empty', text: S.noBoxes })); return; }
    boxes.forEach(b => {
      const on = b.id === state.boxId;
      const btn = h('button', {
        type: 'button', class: 'box' + (on ? ' on' : ''), role: 'radio', 'aria-checked': String(on), disabled: !b.available, 'data-id': b.id,
      }, [
        b.thumb ? h('img', { class: 'box__img', src: b.thumb, alt: '', width: 96, height: 96, loading: 'lazy' })
          : h('span', { class: 'box__sw', style: b.swatch ? `background:${b.swatch}` : null }),
        h('span', { class: 'box__name', text: b.name }),
        h('span', { class: 'box__price', text: b.available ? (b.priceText || '') : S.soldOut }),
      ]);
      el.boxes.append(btn);
    });
  }

  /* ---------- Step 2: categories + designs ---------- */
  function renderCats() {
    el.cats.replaceChildren();
    cats.forEach(c => {
      const d = getDesign(c.key);
      const open = state.open === c.key;
      const thumb = d && (d.thumb || d.layer);
      const img = thumb ? h('img', { src: thumb, alt: '', width: 64, height: 64, loading: 'lazy' })
        : c.icon ? h('img', { src: c.icon, alt: '', width: 64, height: 64, loading: 'lazy' }) : null;
      el.cats.append(h('button', {
        type: 'button', class: 'cat' + (d ? ' done' : '') + (open ? ' open' : ''), 'data-key': c.key, 'aria-expanded': String(open),
      }, [
        img || h('span', { class: 'cat__ph', 'aria-hidden': 'true', text: '+' }),
        h('span', { class: 'cat__label', text: c.label }),
        h('span', { class: 'cat__pick', text: d ? d.name : (open ? 'Choose below' : (c.optional ? 'Optional extra' : 'Tap to choose')) }),
        d ? h('span', { class: 'cat__tick', 'aria-hidden': 'true', text: '✓' }) : null,
      ]));
    });
  }

  function renderDesigns() {
    const key = state.open;
    el.designs.replaceChildren();
    if (!key) { el.designs.hidden = true; return; }
    const c = cats.find(x => x.key === key);
    const list = catDesigns(key);
    el.designs.hidden = false;
    el.designs.append(h('h3', { text: c.label }));
    if (!list.length) { el.designs.append(h('p', { class: 'empty', text: S.noDesigns })); return; }
    const grid = h('div', { class: 'designs__grid', role: 'radiogroup', 'aria-label': c.label });
    list.forEach(d => {
      const on = state.picks[key] === d.id;
      const thumb = d.thumb || d.layer;
      grid.append(h('button', {
        type: 'button', class: 'design' + (on ? ' on' : '') + (d.available ? '' : ' out'), role: 'radio', 'aria-checked': String(on),
        disabled: !d.available, 'data-id': d.id,
      }, [
        thumb ? h('img', { src: thumb, alt: '', width: 120, height: 120, loading: 'lazy' })
          : h('span', { class: 'design__ph', style: d.swatch ? `background:${d.swatch}` : null, 'aria-hidden': 'true' }),
        h('span', { class: 'design__name', text: d.name }),
        d.available ? null : h('span', { class: 'design__out', text: S.soldOut }),
      ]));
    });
    el.designs.append(grid);
  }

  /* ---------- Live preview ---------- */
  const TRAY = { chain: [5, 14], anklet: [29, 14], bracelet: [53, 14], earrings: [5, 52], scrunchie: [29, 52], ring: [53, 52] };
  function buildSlots() {
    cats.forEach(c => {
      const s = c.slot;
      el.slots.append(h('div', {
        class: 'slot', 'data-slot': c.key,
        style: tray ? null : `left:${s.x}%;top:${s.y}%;width:${s.w}%;height:${s.h}%`,
      }, [h('span', { class: 'slot__ph', text: c.label })]));
    });
  }

  function paintSlot(key, animate) {
    const slot = el.slots.querySelector(`[data-slot="${key}"]`);
    const d = getDesign(key);
    slot.replaceChildren();
    slot.classList.toggle('filled', !!d);
    if (!d) { slot.append(h('span', { class: 'slot__ph', text: cats.find(c => c.key === key).label })); return; }
    const src = d.layer || d.thumb;
    let node;
    if (src) node = h('img', { class: 'slot__img', src, alt: `${cats.find(c => c.key === key).label}: ${d.name}`, decoding: 'async' });
    else node = h('span', { class: 'slot__tile', style: d.swatch ? `background:${d.swatch}` : null, text: d.name });
    if (animate) node.classList.add('is-pop');
    slot.append(node);
  }

  function paintBox() {
    const b = getBox();
    const placeholder = data.placeholder;
    el.stageBox.src = (b && b.boxImage) || placeholder;
    el.stageBox.alt = b ? `${b.name} jewellery box` : '';
    el.lidImg.src = (b && b.lidImage) || (b && b.boxImage) || placeholder;
    const e = (b && b.engraving) || {};
    el.lid.style.setProperty('--eng-x', (e.x != null ? e.x : 50) + '%');
    el.lid.style.setProperty('--eng-y', (e.y != null ? e.y : 52) + '%');
    el.lid.style.setProperty('--eng-rot', (e.rotate != null ? e.rotate : 0) + 'deg');
    el.lid.style.setProperty('--eng-size', e.size != null ? e.size : 9);
    root.style.setProperty('--box-tint', (b && b.swatch) || '');
    const missing = !b || !b.boxImage;
    el.note.textContent = missing && !tray ? (S.placeholderNote || '') : '';
  }

  function paintName() {
    el.lidText.textContent = state.name || S.yourName || '';
    el.lid.classList.toggle('has-name', !!state.name);
    el.count.textContent = `${[...state.name].length} / 15`;
  }

  /* ---------- Summary / button ---------- */
  function paintSummary() {
    const n = chosenCount();
    const b = getBox();
    el.price.textContent = (b && b.priceText) || '—';
    el.progress.textContent = (S.piecesSelected || '{n} of 6 pieces selected').replace('{n}', n);
    el.dots.replaceChildren(...required.map(c => h('i', { class: getDesign(c.key) ? 'on' : '' })));
    const ready = !!b && b.available && n === required.length;
    if (preview) {
      /* preview only: the button never works */
      el.add.disabled = true;
      el.add.textContent = S.previewLabel || 'COMING SOON';
      el.msg.textContent = ready ? (S.previewDone || '') : (b ? (S.chooseMore || '').replace('{n}', required.length - n) : '');
      return;
    }
    el.add.disabled = !ready || state.busy;
    if (!state.busy) el.msg.textContent = ready ? '' : (b ? (S.chooseMore || '').replace('{n}', required.length - n) : '');
  }

  /* ---------- Events ---------- */
  el.boxes.addEventListener('click', e => {
    const btn = e.target.closest('.box');
    if (!btn || btn.disabled) return;
    state.boxId = Number(btn.dataset.id);
    renderBoxes(); paintBox(); paintSummary();
  });

  el.cats.addEventListener('click', e => {
    const btn = e.target.closest('.cat');
    if (!btn) return;
    state.open = state.open === btn.dataset.key ? null : btn.dataset.key;
    renderCats(); renderDesigns();
    if (state.open) el.designs.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  });

  el.designs.addEventListener('click', e => {
    const btn = e.target.closest('.design');
    if (!btn || btn.disabled) return;
    const key = state.open;
    const hadPick = !!state.picks[key];
    state.picks[key] = btn.dataset.id;
    paintSlot(key, true);
    /* guide the shopper: after a first pick, open the next category that is still empty */
    if (!hadPick) {
      const next = cats.slice(cats.findIndex(c => c.key === key) + 1).concat(cats).find(c => !state.picks[c.key] && catDesigns(c.key).length);
      if (next) state.open = next.key;
    }
    renderCats(); renderDesigns(); paintSummary();
  });

  const clean = v => v.replace(/[^\p{L}\p{M} .,'&!?-]/gu, '').replace(/\s{2,}/g, ' ').replace(/^\s+/, '');
  el.name.addEventListener('input', () => {
    const v = [...clean(el.name.value)].slice(0, 15).join('');
    if (v !== el.name.value) el.name.value = v;
    state.name = v;
    paintName();
  });

  /* Re-read stock from the live page right before adding, so a design that sold out meanwhile is caught. */
  async function freshStock() {
    try {
      const res = await fetch(location.pathname + location.search, { headers: { Accept: 'text/html' }, cache: 'no-store' });
      if (!res.ok) return null;
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const node = doc.querySelector('[data-byob-data]');
      return node ? JSON.parse(node.textContent) : null;
    } catch { return null; }
  }

  el.add.addEventListener('click', async () => {
    const b = getBox();
    if (preview || !b || el.add.disabled) return;
    state.busy = true; el.add.disabled = true; el.add.classList.add('loading'); el.msg.textContent = '';
    try {
      const fresh = await freshStock();
      if (fresh) {
        const live = new Map(fresh.designs.map(d => [d.id, d]));
        const lb = fresh.boxes.find(x => x.id === b.id);
        if (lb) { Object.assign(b, { available: lb.available, price: lb.price, priceText: lb.priceText }); }
        let changed = false;
        designs.forEach(d => { const l = live.get(d.id); if (l && l.available !== d.available) { d.available = l.available; changed = true; } });
        if (changed) {
          cats.forEach(c => { const d = getDesign(c.key); if (d && !d.available) { delete state.picks[c.key]; paintSlot(c.key, false); } });
          renderCats(); renderDesigns(); renderBoxes(); paintSummary();
          if (chosenCount() < required.length) { el.msg.textContent = S.stockChanged || ''; return; }
        }
        if (!b.available) { renderBoxes(); paintSummary(); return; }
      }
      const properties = { 'Box color': b.name };
      cats.forEach(c => { const d = getDesign(c.key); if (d) properties[c.prop] = d.name; });
      if (state.name.trim()) properties.Engraving = state.name.trim();
      properties._builder = 'seouluna-byob-v1';
      const body = { id: b.variantId, quantity: 1, properties };
      if (T.addToCart) await T.addToCart(body, S.productTitle || 'Your box');
      else {
        const res = await fetch(`${(T.routes || {}).cartAdd || '/cart/add'}.js`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(((await res.json().catch(() => ({}))).description) || T.strings.error);
        location.href = (T.routes || {}).cart || '/cart';
        return;
      }
      el.msg.textContent = S.added || '';
    } catch (err) {
      el.msg.textContent = err.message || (T.strings || {}).error || '';
    } finally {
      state.busy = false; el.add.classList.remove('loading'); paintSummary();
    }
  });

  /* ---------- Start ---------- */
  buildSlots();
  state.open = (cats.find(c => catDesigns(c.key).length) || cats[0]).key; /* first category starts open so designs are visible straight away */
  renderBoxes(); renderCats(); renderDesigns(); paintBox(); paintName(); paintSummary();
})();
