/* SEOULUNA storefront upgrade: swipe gallery, collection filters, recently viewed. No dependencies, no layout work on scroll. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Product gallery: swipe + dots (reuses the existing thumbnail buttons) ---------- */
  function initGallery() {
    const main = $('[data-gallery]');
    if (!main || main.dataset.ready) return;
    main.dataset.ready = '1';
    const img = $('#ppImg', main);
    const thumbs = () => $$('.pp__thumbs button:not([data-video])');
    if (!img || thumbs().length < 2) return;

    const dots = document.createElement('div');
    dots.className = 'pp__dots';
    dots.setAttribute('aria-hidden', 'true');
    thumbs().forEach(() => dots.append(document.createElement('i')));
    main.append(dots);
    const paint = () => {
      const i = Math.max(0, thumbs().findIndex(b => b.classList.contains('on')));
      [...dots.children].forEach((d, n) => d.classList.toggle('on', n === i));
    };
    paint();
    $('.pp__thumbs').addEventListener('click', () => setTimeout(paint, 0));
    /* variant changes swap the picture elsewhere: keep the dots in step */
    new MutationObserver(() => {
      const t = thumbs().find(b => b.dataset.gallerySrc === img.getAttribute('src'));
      if (t) { thumbs().forEach(b => b.classList.toggle('on', b === t)); paint(); }
    }).observe(img, { attributes: true, attributeFilter: ['src'] });

    const go = step => {
      const list = thumbs();
      const i = Math.max(0, list.findIndex(b => b.classList.contains('on')));
      const next = list[(i + step + list.length) % list.length];
      if (!next) return;
      if (!reduce) { img.classList.add('is-swap'); setTimeout(() => img.classList.remove('is-swap'), 180); }
      next.click();
      /* warm the picture after this one so the next swipe is instant */
      const after = list[(i + step * 2 + list.length * 2) % list.length];
      if (after && after.dataset.gallerySrc) { const pre = new Image(); pre.src = after.dataset.gallerySrc; }
    };

    let x0 = null, y0 = 0;
    main.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; x0 = e.clientX; y0 = e.clientY; }, { passive: true });
    main.addEventListener('pointerup', e => {
      if (x0 === null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    }, { passive: true });
    main.addEventListener('pointercancel', () => { x0 = null; }, { passive: true });
  }

  /* ---------- Collection filters: apply on change, keep URLs clean ---------- */
  function initFilters() {
    const form = $('[data-filters]');
    if (!form || form.dataset.ready) return;
    form.dataset.ready = '1';
    let t;
    form.addEventListener('change', () => { clearTimeout(t); t = setTimeout(() => form.requestSubmit(), 350); });
    form.addEventListener('submit', () => { $$('input[type="number"]', form).forEach(i => { if (i.value === '') i.disabled = true; }); });
    document.addEventListener('click', e => { if (!e.target.closest('.cf__group')) $$('.cf__group[open]').forEach(d => d.removeAttribute('open')); });
  }

  /* ---------- Recently viewed (this browser only) ---------- */
  const KEY = 'seouluna-recent';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const write = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage blocked: feature simply stays empty */ } };
  const money = cents => {
    const cur = window.Shopify && window.Shopify.currency && window.Shopify.currency.active;
    try { return new Intl.NumberFormat(document.documentElement.lang || undefined, { style: 'currency', currency: cur || 'INR' }).format(cents / 100); }
    catch { return (cents / 100).toFixed(2); }
  };
  async function initRecent() {
    const box = $('[data-recent]');
    if (!box || box.dataset.ready) return;
    box.dataset.ready = '1';
    const current = box.dataset.current;
    const list = read();
    const others = list.filter(h => h !== current).slice(0, 4);
    write([current, ...list.filter(h => h !== current)].slice(0, 8));
    if (!others.length) return;
    const root = (window.theme && window.theme.routes && window.theme.routes.root) || '/';
    const out = $('[data-recent-list]', box);
    const results = await Promise.all(others.map(h =>
      fetch(`${root.replace(/\/$/, '')}/products/${encodeURIComponent(h)}.js`).then(r => (r.ok ? r.json() : null)).catch(() => null)));
    results.filter(Boolean).forEach(p => {
      const a = document.createElement('a');
      a.className = 'cg__card';
      a.href = p.url;
      const wrap = document.createElement('div');
      wrap.className = 'cg__img';
      if (p.featured_image) {
        const im = document.createElement('img');
        im.src = p.featured_image.replace(/(\.[a-z]+)(\?|$)/i, '_600x$1$2');
        im.alt = '';
        im.loading = 'lazy';
        im.width = 600; im.height = 750;
        wrap.append(im);
      }
      const h3 = document.createElement('h3');
      h3.textContent = p.title.toUpperCase();
      const price = document.createElement('b');
      price.className = 'cg__price';
      price.textContent = money(p.price);
      a.append(wrap, h3, price);
      out.append(a);
    });
    if (out.children.length) box.hidden = false;
  }

  initGallery(); initFilters(); initRecent();
  document.addEventListener('shopify:section:load', () => { initGallery(); initFilters(); });
})();

/* The pieces: filter buttons (works with the theme editor re-rendering the section) */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-pieces-filter]');
  if (!b) return;
  const root = b.closest('.pc');
  if (!root) return;
  const f = b.dataset.piecesFilter;
  root.querySelectorAll('[data-pieces-filter]').forEach(x => x.classList.toggle('on', x === b));
  root.querySelectorAll('.pc__item').forEach(i => { i.hidden = f !== 'all' && i.dataset.type !== f; });
});
