/* SEOULUNA home page: hero switcher, collection browser, heading reveals.
   Ported from the original site; data comes from Shopify (window.COLL, see snippets/collection-data.liquid). */
(() => {
  'use strict';

  /* Theme editor: re-run the home page scripts after the hero or collection browser is edited */
  document.addEventListener('shopify:section:load', e => {
    if (e.target && e.target.querySelector && e.target.querySelector('#home, #menu')) location.reload();
  });
  const COLL = window.COLL || [];
  if (!COLL.length || !document.getElementById('home')) return;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const showToast = m => window.Seouluna && window.Seouluna.toast(m);
  const World = window.World || { set() {} };
  const Shop = window.Shop;

/* Hero letter-by-letter reveal */
function splitLetters(el) {
  let i = 0;
  (function walk(node) {
    [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok.trim()) { frag.append(tok); return; }
          const w = document.createElement('span');
          w.className = 'w';
          [...tok].forEach(ch => {
            const s = document.createElement('span');
            s.className = 'ch';
            s.textContent = ch;
            s.style.setProperty('--i', i++);
            w.append(s);
          });
          frag.append(w);
        });
        c.replaceWith(frag);
      } else walk(c);
    });
  })(el);
}
if ($('#heroTitle') && !reduceMotion) splitLetters($('#heroTitle'));

/* Section headings: the same letter-by-letter rise, played once when the heading scrolls into view */
function splitOnScroll(el) {
  const label = el.textContent.replace(/\s+/g, ' ').trim();
  let i = 0;
  (function walk(node) {
    [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok.trim()) { frag.append(tok); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.setAttribute('aria-hidden', 'true');
          [...tok].forEach(ch => {
            const s = document.createElement('span');
            s.className = 'lt';
            s.textContent = ch;
            s.style.setProperty('--i', i++);
            w.append(s);
          });
          frag.append(w);
        });
        c.replaceWith(frag);
      } else walk(c);
    });
  })(el);
  el.setAttribute('aria-label', label);
  el.classList.add('lts');
  lettersIO.observe(el);
}
const lettersIO = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('in'); lettersIO.unobserve(en.target); }
}), { threshold: .4 });
$$('#menu h2, #inside h3, .quality h2, .feeling h2, .fbform h3').forEach(splitOnScroll);


/* Hero switcher: one coordinated sequence per collection
   1 product fades + settles back  2 world palette/clouds/particles cross-fade
   3 new product floats up into place  4 name, description and price drift in */
let heroIdx = 0;
let heroTok = 0;
const heroEl = $('#home');
const heroText = () => ['#heroName', '#heroDesc', '.rating', '#heroWord'].map(q => $(q));
const heroProduct = () => ($('#heroVideo').style.display === 'block' ? $('#heroVideo') : $('#heroImg'));
const ENTER = {
  rise:   { dur: 1000, from: { opacity: 0, translate: '0 42px', scale: .9 }, mid: { opacity: 1, translate: '0 -8px', scale: 1.015, offset: .7 } },
  emerge: { dur: 1200, from: { opacity: 0, translate: '0 10px', scale: 1.07 }, mid: { opacity: 1, translate: '0 0', scale: 1.005, offset: .75 } },
  glow:   { dur: 1100, from: { opacity: 0, translate: '0 24px', scale: .95 }, mid: { opacity: 1, translate: '0 -6px', scale: 1.01, offset: .7 } },
};
const rest = { opacity: 1, translate: '0 0', scale: 1 };
const wait = ms => new Promise(r => setTimeout(r, ms));
let outAnims = [];

async function setHero(i) {
  if (i === heroIdx) return;
  const c = COLL[i];
  const tok = ++heroTok;
  heroIdx = i;
  $$('.thumb').forEach((t, n) => t.classList.toggle('active', n === i));

  const still = reduceMotion || !Element.prototype.animate;
  const swap = () => {
    $$('#heroWord span').forEach(s => (s.textContent = c.word));
    $('#heroName').textContent = c.name.toUpperCase();
    $('#heroDesc').textContent = c.desc;
    $('#heroPrice').textContent = c.priceText;
    const lab = $('#heroPriceLabel'); if (lab) lab.textContent = c.from ? c.fromLabel : c.priceLabel;
    const img = $('#heroImg');
    const vid = $('#heroVideo');
    if (c.video) {
      if (c.img) vid.poster = c.img;
      if (vid.getAttribute('src') !== c.video) vid.src = c.video;
      vid.style.display = 'block';
      img.style.display = 'none';
      vid.currentTime = 0;
      vid.play().catch(() => {});
    } else {
      vid.pause();
      vid.style.display = 'none';
      img.style.display = '';
      img.src = c.img;
      img.alt = c.name;
    }
  };
  if (still) { World.set(c.world, true); swap(); return; }

  /* 1 — current product and copy let go */
  /* single-keyframe animations start from wherever the element currently is, so rapid clicks stay smooth */
  outAnims.push(
    heroProduct().animate({ opacity: 0, translate: '0 16px', scale: .92 }, { duration: 400, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }),
    ...heroText().map(el => el.animate({ opacity: 0, translate: '0 -10px' }, { duration: 260, fill: 'forwards' })),
  );
  /* 2 — the atmosphere starts changing while the old product is still leaving */
  await wait(100);
  if (tok !== heroTok) return;
  World.set(c.world);

  /* load the new product off-screen so it never pops in half-decoded */
  const pre = new Image();
  if (!c.video) { pre.src = c.img; }
  await Promise.all([wait(420), c.video ? 0 : (pre.decode ? pre.decode().catch(() => {}) : 0)]);
  if (tok !== heroTok) return;

  /* 3 — new product rises into place */
  swap();
  const style = ENTER[heroEl.dataset.enter] || ENTER.rise;
  const inProd = heroProduct();
  inProd.animate([style.from, style.mid, rest], { duration: style.dur, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
  outAnims.forEach(a => a.cancel());
  outAnims = [];
  /* 4 — copy and price follow, staggered */
  heroText().forEach((el, n) => el.animate([{ opacity: 0, translate: '0 16px' }, { opacity: 1, translate: '0 0' }],
    { duration: 600, delay: 200 + n * 80, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }));
}
$$('.thumb').forEach(t => t.addEventListener('click', () => setHero(+t.dataset.i)));
$('#heroShop').addEventListener('click', e => { e.preventDefault(); Shop.openPdp(COLL[heroIdx].key); });
/* the second button is a normal link (e.g. Build Your Box); only an in-page #anchor scrolls to the collection browser */
$('#heroAdd').addEventListener('click', e => {
  if ((e.currentTarget.getAttribute('href') || '').charAt(0) !== '#') return;
  e.preventDefault();
  goToTab(COLL[heroIdx].key);
});
/* clicking the big picture opens the product */
['#heroVideo', '#heroImg'].forEach(q => { const el = $(q); if (el) { el.style.cursor = 'pointer'; el.addEventListener('click', () => Shop.openPdp(COLL[heroIdx].key)); } });
/* cycle through the collections until the visitor takes over */
if (COLL.length > 1 && !reduceMotion) {
  let paused = false;
  const auto = setInterval(() => { if (!document.hidden && !paused) setHero((heroIdx + 1) % COLL.length); }, 7000);
  const panel = $('.hero__panel');
  if (panel) { panel.addEventListener('mouseenter', () => { paused = true; }); panel.addEventListener('mouseleave', () => { paused = false; }); }
  $('#thumbs').addEventListener('click', () => clearInterval(auto));
}

/* Menu carousel: one card per collection */
let sel = 0;
const cardsEl = $('#cards');
const HEART = '<button class="wish" aria-label="Save to wishlist"><svg viewBox="0 0 24 24"><path d="M12 21s-8-5.200-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.800-8 11-8 11z"/></svg></button>';
const n = COLL.length;

function renderCards() {
  cardsEl.innerHTML = '';
  [-1, 0, 1].forEach((off, k) => {
    const idx = (sel + off + n) % n;
    const c = COLL[idx];
    const el = document.createElement('div');
    el.className = 'card' + (off === 0 ? ' is-active' : '');
    el.dataset.tilt = '';
    el.dataset.key = c.key;
    el.style.setProperty('--k', k);
    el.innerHTML = `${HEART}
      <div class="card__img">${c.img ? `<img src="${c.img}" alt="${c.alt || c.name}" loading="lazy">` : ''}</div>
      <h6>${c.name.toUpperCase()}</h6>
      <p class="card__sub">${c.blurb}</p>
      ${c.sub ? `<p class="card__sub">${c.sub}</p>` : ''}
      <b class="card__price">${c.from ? c.fromLabel + ' ' : ''}${c.priceText}</b>
      <button class="view">${c.viewLabel}</button>
      <button class="add"${c.available ? '' : ' disabled'}>${c.available ? c.addLabel : c.soldOut}</button>`;
    if (window.Shop && Shop.isWished(c.key)) $('.wish', el).classList.add('on');
    $('.add', el).addEventListener('click', e => { e.stopPropagation(); Shop.add(c.key, 1, e.currentTarget); });
    $('.view', el).addEventListener('click', e => { e.stopPropagation(); location.href = c.url; });
    el.addEventListener('click', () => { if (off !== 0) pick(idx); else Shop.openPdp(c.key); });
    cardsEl.appendChild(el);
  });
  const c = COLL[sel];
  $$('#tabs button').forEach(x => x.classList.toggle('active', x.dataset.tab === c.key));
  const tag = $('#tag');
  tag.style.opacity = 0;
  setTimeout(() => { tag.textContent = c.tag; tag.style.opacity = 1; }, 200);
  const list = $('#insideList');
  if (list) list.innerHTML = (Array.isArray(c.inside) ? c.inside : []).map((t, i) => `<li style="--i:${i}">${t}</li>`).join('');
}
function pick(i) {
  sel = (i + n) % n;
  cardsEl.style.opacity = 0;
  setTimeout(() => { renderCards(); cardsEl.style.opacity = 1; }, 150);
}
function goToTab(key) {
  pick(COLL.findIndex(c => c.key === key));
  $('#menu').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}
$('#prev').addEventListener('click', () => pick(sel - 1));
$('#next').addEventListener('click', () => pick(sel + 1));
$$('#tabs button').forEach(b => b.addEventListener('click', () => pick(COLL.findIndex(c => c.key === b.dataset.tab))));
renderCards();

/* faces: swap the model every 5s */
(function () {
  var box = document.getElementById('faces'); if (!box) return;
  var imgs = box.querySelectorAll('img'), i = 0, t = null;
  function next() { imgs[i].classList.remove('on'); i = (i + 1) % imgs.length; imgs[i].classList.add('on'); }
  function start() { if (!t) t = setInterval(next, 5000); }
  function stop() { clearInterval(t); t = null; }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(box); else start();
})();

})();
