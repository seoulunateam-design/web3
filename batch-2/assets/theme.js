/* SEOULUNA theme: interactions. All commerce goes through Shopify's cart + checkout. */
(() => {
  'use strict';
  const T = window.theme || { routes: {}, settings: {}, strings: {} };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ---------- Loader ---------- */
  const loader = $('#loader');
  if (loader) {
    const hide = () => setTimeout(() => loader.classList.add('done'), 250);
    if (document.readyState === 'complete') hide(); else window.addEventListener('load', hide);
  }

  /* ---------- Cart drawer ---------- */
  let lastFocus = null;
  const drawer = () => $('#cartDrawer');
  function openDrawer() {
    const d = drawer();
    if (!d) return false;
    lastFocus = document.activeElement;
    d.classList.add('open');
    d.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const x = $('.ov__x', d);
    if (x) x.focus({ preventScroll: true });
    return true;
  }
  function closeDrawer() {
    const d = drawer();
    if (!d) return;
    d.classList.remove('open');
    d.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  async function refreshDrawer() {
    const res = await fetch(`${T.routes.root}?sections=cart-drawer`);
    if (!res.ok) throw new Error('drawer');
    const json = await res.json();
    const doc = new DOMParser().parseFromString(json['cart-drawer'], 'text/html');
    const fresh = $('#cartDrawer', doc);
    const cur = drawer();
    if (!fresh || !cur) return;
    cur.innerHTML = fresh.innerHTML;
    const count = $('[data-cart-count]', fresh);
    if (count) $$('[data-cart-count]').forEach(el => { el.textContent = count.textContent; });
  }
  function bump() {
    const b = $('#bag');
    if (!b) return;
    b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  }
  async function cartRequest(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: body instanceof FormData ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.description || data.message || T.strings.error);
    return data;
  }
  async function addToCart(body, title) {
    /* throws (with Shopify's own message, e.g. "all 3 are in your cart") when Shopify rejects the item: nothing is reported as added */
    await cartRequest(`${T.routes.cartAdd}.js`, body);
    try {
      await refreshDrawer();
    } catch {
      /* the item IS in the cart but the drawer could not be refreshed: show the real cart page instead of guessing */
      location.href = T.routes.cart;
      return;
    }
    bump();
    openDrawer();
    if (title) toast(`${title} ${T.strings.added}`);
  }

  /* shared with assets/builder.js (Build Your Own Box) */
  T.addToCart = addToCart;

  document.addEventListener('click', async e => {
    const open = e.target.closest('[data-cart-open]');
    if (open && drawer()) { e.preventDefault(); await refreshDrawer().catch(() => {}); openDrawer(); return; }
    if (e.target.closest('[data-cart-close]')) { closeDrawer(); return; }

    const add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      if (add.classList.contains('loading')) return;
      add.classList.add('loading');
      const old = add.textContent;
      try {
        await addToCart({ id: Number(add.dataset.variantId), quantity: 1 }, add.dataset.productTitle);
        add.textContent = 'ADDED ✓';
        add.classList.add('added');
        setTimeout(() => { add.textContent = old; add.classList.remove('added'); }, 1300);
      } catch (err) { toast(err.message || T.strings.error); }
      add.classList.remove('loading');
      return;
    }

    const q = e.target.closest('[data-qty]');
    if (q && q.closest('#cartDrawer')) {
      q.disabled = true;
      try {
        await cartRequest(`${T.routes.cartChange}.js`, { line: Number(q.dataset.line), quantity: Number(q.dataset.qty) });
        await refreshDrawer();
        bump();
      } catch (err) { toast(err.message || T.strings.error); q.disabled = false; }
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  /* ---------- Product page ---------- */
  function formatMoney(cents, format) {
    const f = format || window.theme.moneyFormat || '{{amount}}';
    const num = (v, dec, thou, point) => {
      const n = (v / 100).toFixed(dec).split('.');
      return n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${thou}`) + (n[1] ? point + n[1] : '');
    };
    return f.replace(/\{\{\s*(\w+)\s*\}\}/, (_, k) => ({
      amount: num(cents, 2, ',', '.'),
      amount_no_decimals: num(cents, 0, ',', '.'),
      amount_with_comma_separator: num(cents, 2, '.', ','),
      amount_no_decimals_with_comma_separator: num(cents, 0, '.', ','),
      amount_with_apostrophe_separator: num(cents, 2, "'", '.'),
    }[k] || num(cents, 2, ',', '.')));
  }
  function initProduct(root = document) {
    const sec = $('[data-product]', root);
    if (!sec || sec.dataset.ready) return;
    sec.dataset.ready = '1';
    const form = $('[data-product-form]', sec);
    if (!form) return;
    const variants = JSON.parse($('[data-variants]', form).textContent);
    const input = $('[data-variant-input]', form);
    const selects = $$('[data-option]', form);
    const btn = $('[data-add-submit]', form);
    const buy = $('[data-buy-now]', form);
    const label = $('[data-add-label]', form);
    const avail = $('[data-availability]', sec);
    const priceEl = $('[data-price]', sec);
    const totalEl = $('[data-total]', sec);
    const err = $('[data-form-error]', form);
    const qtyInput = $('[data-pq-input]', form);
    let current = variants.find(v => String(v.id) === String(input.value)) || variants[0];

    function updateTotal() {
      if (totalEl && current) totalEl.textContent = formatMoney(current.price * (Number(qtyInput.value) || 1));
    }
    function onVariant() {
      const chosen = selects.map(s => s.value);
      const v = variants.find(x => chosen.every((val, i) => x[`option${i + 1}`] === val));
      if (!v) { btn.disabled = true; if (buy) buy.disabled = true; label.textContent = T.strings.soldOut; return; }
      current = v;
      input.value = v.id;
      btn.disabled = !v.available;
      if (buy) buy.disabled = !v.available;
      label.textContent = v.available ? T.strings.addToCart : T.strings.soldOut;
      if (avail) avail.textContent = v.available ? T.strings.inStock : T.strings.soldOut;
      if (priceEl) {
        priceEl.innerHTML = v.compare_at_price > v.price
          ? `<s>${formatMoney(v.compare_at_price)}</s> ${formatMoney(v.price)}`
          : formatMoney(v.price);
      }
      if (v.featured_image && v.featured_image.src) showImage(v.featured_image.src, v.featured_image.alt);
      updateTotal();
      history.replaceState(null, '', `${location.pathname}?variant=${v.id}`);
    }
    selects.forEach(s => s.addEventListener('change', onVariant));

    const setQty = n => { qtyInput.value = Math.max(1, Math.min(99, n)); updateTotal(); };
    $$('[data-pq]', form).forEach(b => b.addEventListener('click', () => setQty((Number(qtyInput.value) || 1) + Number(b.dataset.pq))));
    qtyInput.addEventListener('change', () => setQty(Number(qtyInput.value) || 1));

    /* gallery: photos and (optional) product video */
    const mainImg = $('#ppImg', sec);
    const vid = $('#ppVid', sec);
    function showImage(src, alt) {
      if (!mainImg || mainImg.tagName !== 'IMG') return;
      if (vid) { vid.pause(); vid.hidden = true; }
      mainImg.hidden = false;
      mainImg.removeAttribute('srcset');
      mainImg.src = src;
      if (alt != null) mainImg.alt = alt;
    }
    $$('.pp__thumbs button', sec).forEach(b => b.addEventListener('click', () => {
      $$('.pp__thumbs button', sec).forEach(x => x.classList.toggle('on', x === b));
      if (b.hasAttribute('data-video') && vid) { mainImg.hidden = true; vid.hidden = false; vid.play().catch(() => {}); }
      else showImage(b.dataset.gallerySrc, b.dataset.galleryAlt || '');
    }));

    const title = () => ($('.pp__title', sec) || {}).textContent || '';
    async function submit(goCheckout) {
      if (btn.disabled) return;
      err.hidden = true;
      btn.classList.add('loading');
      try {
        /* the selected variant (hidden "id" input, kept in sync by onVariant) and the requested quantity */
        qtyInput.value = Math.max(1, Math.min(99, Number(qtyInput.value) || 1));
        const body = new FormData(form);
        if (goCheckout) {
          /* Buy it now: add first, and only go to checkout once Shopify accepted the item.
             The checkout URL comes from Liquid so it keeps the shopper's language/market prefix. */
          await cartRequest(`${T.routes.cartAdd}.js`, body);
          location.href = T.routes.checkout || '/checkout';
          return;
        }
        await addToCart(body, title().trim());
      } catch (ex) { err.textContent = ex.message || T.strings.error; err.hidden = false; }
      btn.classList.remove('loading');
    }
    form.addEventListener('submit', e => {
      if (!drawer()) return; // no drawer: fall back to Shopify's normal form post
      e.preventDefault();
      submit(false);
    });
    if (buy) buy.addEventListener('click', () => submit(true));
    updateTotal();
  }

  /* ---------- Feedback stars ---------- */
  function initStars(root = document) {
    const box = $('#fbStars', root);
    if (!box || box.dataset.ready) return;
    box.dataset.ready = '1';
    const stars = $$('button', box);
    const input = $('[data-rating-input]', box);
    let rating = 5;
    const paint = v => stars.forEach(b => b.classList.toggle('on', +b.dataset.v <= v));
    stars.forEach(b => {
      b.addEventListener('click', () => { rating = +b.dataset.v; input.value = rating; paint(rating); });
      b.addEventListener('mouseenter', () => paint(+b.dataset.v));
      b.addEventListener('mouseleave', () => paint(rating));
    });
    paint(rating);
  }

  /* ---------- Navigation ---------- */
  const pill = $('#navPill');
  const burger = $('#burger');
  const nav = $('#nav');
  if (burger && pill) {
    burger.addEventListener('click', () => {
      const open = pill.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    pill.addEventListener('click', e => {
      if (e.target.closest('a')) { pill.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- Scroll effects ---------- */
  const para = $$('[data-parallax]');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
      if (!reduceMotion) {
        para.forEach(el => {
          const r = el.getBoundingClientRect();
          const y = (r.top + r.height / 2 - innerHeight / 2) * parseFloat(el.dataset.parallax);
          el.style.translate = `0 ${y.toFixed(1)}px`;
        });
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .15 });
  function observeReveals(root = document) {
    $$('[data-reveal], [data-stagger]', root).forEach(el => {
      if (el.dataset.observed) return;
      el.dataset.observed = '1';
      if (el.hasAttribute('data-stagger')) [...el.children].forEach((c, i) => c.style.setProperty('--i', i));
      io.observe(el);
    });
  }

  /* ---------- Hover micro-interactions ---------- */
  if (finePointer && !reduceMotion) {
    document.addEventListener('mousemove', e => {
      const t = e.target.closest('[data-tilt]');
      $$('[data-tilt]').forEach(el => { if (el !== t && el.style.transform) el.style.transform = ''; });
      if (t) {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        t.style.transform = `perspective(700px) rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 11).toFixed(2)}deg)`;
      }
      const m = e.target.closest('.btn, .nav__icons a, .nav__icons button, .arrow, .thanks__go');
      $$('.is-mag').forEach(el => { if (el !== m) { el.style.translate = ''; el.classList.remove('is-mag'); } });
      if (m) {
        const r = m.getBoundingClientRect();
        m.classList.add('is-mag');
        m.style.translate = `${((e.clientX - (r.left + r.width / 2)) * .22).toFixed(1)}px ${((e.clientY - (r.top + r.height / 2)) * .3).toFixed(1)}px`;
      }
    });
    if (T.settings.cursor) {
      const cur = document.createElement('div');
      cur.className = 'cursor';
      document.documentElement.appendChild(cur); // outside <body>, which may be zoomed
      document.addEventListener('mousemove', e => {
        cur.classList.add('on');
        cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        cur.classList.toggle('hot', !!e.target.closest('a, button, .card, .pcard, input, select, textarea'));
      });
      document.addEventListener('mouseleave', () => cur.classList.remove('on'));
    }
  }

  /* ---------- Misc ---------- */
  function initMisc(root = document) {
    $$('[data-toggle-recover]', root).forEach(a => {
      if (a.dataset.ready) return;
      a.dataset.ready = '1';
      a.addEventListener('click', e => {
        e.preventDefault();
        const rec = $('#recover'), login = $('#loginPanel');
        const showRec = rec.hidden;
        rec.hidden = !showRec; login.hidden = showRec;
      });
    });
    if (location.hash === '#recover' && $('#recover')) { $('#recover').hidden = false; $('#loginPanel').hidden = true; }
    $$('select[data-selected]', root).forEach(s => { if (s.dataset.selected) s.value = s.dataset.selected; });
    $$('.ribbon__track', root).forEach(t => { if (!t.dataset.dup) { t.dataset.dup = '1'; t.innerHTML += t.innerHTML; } });
  }

  /* ---------- Scale the 1200px design up on large screens ---------- */
  function fitScale() {
    if (!T.settings.scaleLarge) return;
    const w = window.innerWidth;
    const z = w > 1200 ? Math.min(w / 1200, 2.2) : 1;
    document.body.style.zoom = z;
    document.documentElement.style.setProperty('--z', z);
    /* pop-ups (bag) cap their own scale so they stay a comfortable size on big screens */
    document.documentElement.style.setProperty('--ov-zoom', (Math.min(z, 1) / z).toFixed(3));
  }
  fitScale();
  window.addEventListener('resize', fitScale);

  /* ---------- Wishlist (kept in this browser only) + the small API home.js uses ---------- */
  const WISH_KEY = 'seouluna-wish';
  const readWish = () => { try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; } catch { return []; } };
  const writeWish = v => { try { localStorage.setItem(WISH_KEY, JSON.stringify(v)); } catch {} };
  const findColl = key => (window.COLL || []).find(c => c.key === key);

  window.Shop = {
    add(key, qty = 1, btn) {
      const c = findColl(key);
      if (!c) return false;
      if (c.available === false) { toast(T.strings.soldOut); return false; }
      /* collections whose lead product has options go to the product page so the shopper can choose */
      if (!c.variantId) { location.href = c.productUrl; return false; }
      if (btn) btn.classList.add('loading');
      const old = btn && (btn.dataset.label || btn.textContent);
      addToCart({ id: Number(c.variantId), quantity: qty }, c.name)
        .then(() => {
          if (!btn) return;
          btn.dataset.label = old;
          btn.textContent = 'ADDED ✓';
          btn.classList.add('added');
          setTimeout(() => { btn.textContent = old; btn.classList.remove('added'); }, 1300);
        })
        .catch(err => toast(err.message || T.strings.error))
        .finally(() => { if (btn) btn.classList.remove('loading'); });
      return true;
    },
    openPdp(key) { const c = findColl(key); if (c) location.href = c.productUrl; },
    openBag() { return refreshDrawer().catch(() => {}).then(openDrawer); },
    isWished: key => readWish().includes(key),
    toggleWish(key) {
      const list = readWish();
      const i = list.indexOf(key);
      if (i >= 0) list.splice(i, 1); else list.push(key);
      writeWish(list);
      return i < 0;
    },
  };
  window.Seouluna = { toast, addToCart, openDrawer, closeDrawer };

  document.addEventListener('click', e => {
    const w = e.target.closest('.wish');
    if (!w) return;
    e.stopPropagation();
    const key = w.closest('[data-key]') && w.closest('[data-key]').dataset.key;
    if (!key) return;
    const on = window.Shop.toggleWish(key);
    w.classList.toggle('on', on);
    toast(on ? T.strings.wishAdded : T.strings.wishRemoved);
  });

  /* collection page: sort order */
  const sortSel = $('#SortBy');
  if (sortSel) sortSel.addEventListener('change', () => {
    const u = new URL(location.href);
    u.searchParams.set('sort_by', sortSel.value);
    u.searchParams.delete('page');
    location.href = u.toString();
  });

  /* ---------- Init (also re-runs for the Theme Editor) ---------- */
  function init(root = document) {
    initProduct(root); initStars(root); initMisc(root); observeReveals(root);
  }
  init();
  document.addEventListener('shopify:section:load', e => init(e.target));
})();

/* Mascot: three poses that swap every 3 seconds (logo, loader, bag, cart page, footer seal) */
(() => {
  const full = (window.theme || {}).mascots || [];
  const logo = (window.theme || {}).mascotLogos || [];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !full.length) return;
  [...full, ...logo].forEach(u => { const i = new Image(); i.src = u; });
  let n = 0;
  const sync = () => {
    document.documentElement.style.setProperty('--mascot', `url(${full[n]})`);
    document.querySelectorAll('.kbag__mascot').forEach(im => { if (im.getAttribute('src') !== full[n]) im.setAttribute('src', full[n]); });
    const li = document.getElementById('logoImg');
    if (li && li.getAttribute('href') !== logo[n]) li.setAttribute('href', logo[n]);
  };
  const root = document.documentElement;
  setInterval(() => {
    if (document.hidden) return;
    n = (n + 1) % full.length;
    root.classList.add('mascot-out');            /* shrink + fade out */
    setTimeout(() => { sync(); root.classList.remove('mascot-out'); }, 260);   /* swap, then bounce back in */
  }, 3000);
  /* the bag redraws its markup: keep new mascot images on the current pose */
  new MutationObserver(() => { const im = document.querySelector('.kbag__mascot'); if (im && im.getAttribute('src') !== full[n]) sync(); }).observe(document.body, { childList: true, subtree: true });
})();
