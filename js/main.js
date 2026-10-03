/* PACELINE – shared behaviour. Layout (top bar, header, footer) is defined once here. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const page = document.body.dataset.page;
  const ico = d => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

  /* ---------- Layout ---------- */
  const links = [['Men', 'men.html'], ['Women', 'women.html'], ['Footwear', 'footwear.html'], ['Apparel', 'apparel.html'], ['Brands', 'brands.html'], ['Sale', 'sale.html'], ['About', 'about.html']];
  // Footer link targets (anything not listed stays a placeholder)
  const dest = { "Men's": 'men.html', "Women's": 'women.html', Footwear: 'footwear.html', Apparel: 'apparel.html', Accessories: 'apparel.html?type=Accessories', Sale: 'sale.html', 'About Us': 'about.html', 'Size Guides': 'footwear.html', 'Gait Analysis': 'gait.html' };
  $('#top').innerHTML = `<div class="topbar"><div class="wrap"><span>Free UK delivery over £75 · 30-day returns</span><span><b>Autumn '26 — new arrivals dropping weekly</b></span><span>Store: Glasgow · EN / £ GBP</span></div></div>
  <header id="hdr"><div class="wrap"><a class="logo" href="index.html" aria-label="Paceline home">PACELINE</a>
  <nav id="nav" aria-label="Main"><ul>${links.map(([t, h]) => `<li><a href="${h}"${t.toLowerCase() === page ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}</ul></nav>
  <div class="tools"><button class="ib" id="sbtn" aria-label="Search">${ico('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>')}</button>
  <button class="ib" id="abtn" aria-label="Log in or sign up">${ico('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>')}</button>
  <button class="ib" id="cart" aria-label="Cart, 0 items">${ico('<path d="M3 4h2l2.5 11h10L20 7H6"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/>')}<span class="badge" id="cnt" hidden>0</span></button>
  <button class="ib burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="nav"><span><i></i><i></i><i></i></span></button></div></div></header><div class="scrim" id="scrim"></div>`;
  const cols = { Shop: ["Men's", "Women's", 'Footwear', 'Apparel', 'Accessories', 'Sale'], Help: ['Contact', 'Shipping', 'Returns', 'Size Guides', 'Gait Analysis', 'FAQs'], Company: ['About Us', 'Store · Glasgow', 'Sustainability', 'Careers', 'Wholesale', 'Press'], Follow: ['Instagram', 'Strava', 'TikTok', 'YouTube', 'Newsletter', 'Blog'] };
  $('#ftr').innerHTML = `<footer><div class="wrap"><div class="news"><div><h2>Join the Paceline club.</h2><p>Early access to new drops, race-day tips, and 10% off your first order.</p></div>
  <form id="nf" novalidate><label class="sr" for="em">Email address</label><input id="em" type="email" placeholder="your@email.com" required autocomplete="email"><button>SUBSCRIBE</button><p id="msg" role="status"></p></form></div>
  <div class="fg"><div><a class="logo" href="index.html">PACELINE</a><p>Race-day gear, trail-tested essentials, and everyday running kit — curated in Glasgow since 2015.</p></div>
  ${Object.entries(cols).map(([h, l]) => `<div><h4>${h.toUpperCase()}</h4><ul>${l.map(x => `<li><a href="${dest[x] || '#'}">${x}</a></li>`).join('')}</ul></div>`).join('')}</div>
  <div class="legal"><p>© 2026 Paceline Running Co. — All rights reserved.</p><span><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a><a href="#">Accessibility</a></span></div></div></footer>`;

  /* ---------- Mobile nav (smooth slide-in drawer) ---------- */
  const nav = $('#nav'), burger = $('#burger'), scrim = $('#scrim');
  const toggle = open => {
    nav.classList.toggle('open', open); scrim.classList.toggle('on', open);
    burger.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.onclick = () => toggle(!nav.classList.contains('open'));
  scrim.onclick = () => toggle(false);
  addEventListener('keydown', e => e.key === 'Escape' && toggle(false));

  /* Header slides away on scroll down, returns on scroll up */
  let last = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    $('#hdr').classList.toggle('hide', y > last && y > 200 && !nav.classList.contains('open'));
    last = y;
  }, { passive: true });

  /* ---------- Page zoom transition between pages ---------- */
  $$('a[href*=".html"]').forEach(a => a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || a.target || (a.pathname === location.pathname && a.hash)) return;
    e.preventDefault(); document.documentElement.classList.add('out');
    setTimeout(() => (location.href = a.href), 330);
  }));
  addEventListener('pageshow', e => e.persisted && document.documentElement.classList.remove('out'));

  /* ---------- Scroll reveal + count-up stats ---------- */
  const count = el => {
    const n = +el.dataset.n, s = el.dataset.s || ''; let t0;
    const step = t => { t0 ??= t; const p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + s; p < 1 && requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); $$('[data-n]', e.target).forEach(count); io.unobserve(e.target);
  }), { threshold: .15 }) : null;
  $$('.rv').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  /* ---------- Hero slider ---------- */
  const slides = $$('.slide');
  if (slides.length) {
    const dots = $('.dots'); let i = 0, timer;
    slides.forEach((_, k) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Slide ' + (k + 1)); b.onclick = () => { go(k); play(); }; dots.append(b); });
    const go = k => { i = k; slides.forEach((s, j) => { s.classList.toggle('on', j === k); s.setAttribute('aria-hidden', j !== k); }); $$('button', dots).forEach((b, j) => b.setAttribute('aria-current', j === k)); };
    const play = () => { clearInterval(timer); timer = setInterval(() => go((i + 1) % slides.length), 6000); };
    go(0); play();
    $('.hero').addEventListener('mouseenter', () => clearInterval(timer)); $('.hero').addEventListener('mouseleave', play);
  }

  /* ---------- Product filter tabs ---------- */
  $$('.tabs button').forEach(b => b.onclick = () => {
    $$('.tabs button').forEach(x => x.setAttribute('aria-pressed', x === b));
    $$('.pc').forEach(c => {
      const show = c.dataset.tags.includes(b.dataset.f);
      if (show) { c.hidden = false; requestAnimationFrame(() => c.classList.remove('fade')); }
      else { c.classList.add('fade'); setTimeout(() => c.classList.contains('fade') && (c.hidden = true), 350); }
    });
  });
  $$('.heart').forEach(h => h.onclick = () => h.setAttribute('aria-pressed', h.getAttribute('aria-pressed') !== 'true'));

  /* ---------- Touch support for hover descriptions ---------- */
  $$('.hv').forEach(h => h.addEventListener('click', e => { if (matchMedia('(hover:none)').matches && !e.target.closest('a')) h.classList.toggle('on'); }));

  /* ---------- Newsletter ---------- */
  $('#nf').addEventListener('submit', e => {
    e.preventDefault(); const em = $('#em'), m = $('#msg');
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value);
    m.textContent = ok ? "You're in! Your first mile is on us — check your inbox." : 'Please enter a valid email address.';
    if (ok) em.value = '';
  });
})();
