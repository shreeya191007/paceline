/* PACELINE – interactive UI shared by every page:
   cart drawer · search overlay · log in / sign up modal · account menu · toasts.
   Depends on store.js, products.js and the header built by main.js. */
(() => {
  'use strict';
  const S = window.Store, $ = (s, r = document) => r.querySelector(s), esc = S.esc;
  const hdr = $('#hdr'), sbtn = $('#sbtn'), abtn = $('#abtn'), cbtn = $('#cart'), cnt = $('#cnt');
  const iconAcct = abtn.innerHTML;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const X = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const UI = window.UI = {};

  /* ---------- markup for the three overlays ---------- */
  const tpl = document.createElement('div');
  tpl.innerHTML = `
  <div class="pscrim" id="pscrim"></div>
  <aside class="panel cartp" id="cartp" role="dialog" aria-modal="true" aria-labelledby="ct" tabindex="-1">
    <div class="phd"><h2 id="ct">Your bag</h2><button class="xb" data-close aria-label="Close bag">${X}</button></div>
    <div class="pbd" id="cb"></div><div class="pft" id="cf"></div>
  </aside>
  <div class="panel search" id="search" role="dialog" aria-modal="true" aria-label="Search products" tabindex="-1">
    <form class="sf2" id="sform" role="search">
      <label class="sr" for="sq">Search products</label>
      <input id="sq" type="search" placeholder="Search shoes, jackets, brands…" autocomplete="off">
      <button class="btn b-k" type="submit">Search</button>
      <button class="xb" type="button" data-close aria-label="Close search">${X}</button>
    </form>
    <div id="sres" aria-live="polite"></div>
  </div>
  <div class="panel modal" id="auth" role="dialog" aria-modal="true" aria-labelledby="at" tabindex="-1">
    <div class="phd" style="padding:0 0 12px;border:0"><h2 id="at">Welcome back</h2><button class="xb" data-close aria-label="Close">${X}</button></div>
    <div class="mtabs" role="tablist" aria-label="Account"><button type="button" role="tab" data-mode="login" id="tl">Log in</button><button type="button" role="tab" data-mode="signup" id="ts">Sign up</button></div>
    <form id="aform" novalidate>
      <div class="fld" id="fname" hidden><label for="aname">Full name</label><input id="aname" autocomplete="name"></div>
      <div class="fld"><label for="aemail">Email</label><input id="aemail" type="email" autocomplete="email"></div>
      <div class="fld"><label for="apw">Password</label><input id="apw" type="password" autocomplete="current-password"><small id="apwh"></small></div>
      <label class="chk"><input type="checkbox" id="show"> Show password</label>
      <p class="msg bad" id="aerr" role="alert"></p>
      <button class="btn b-k" id="asub" style="width:100%;justify-content:center">Log in</button>
    </form>
    <p class="msg" style="margin-top:16px;color:var(--clay)">Demo: accounts are stored only in this browser.</p>
  </div>`;
  document.body.append(...tpl.children);
  const scrim = $('#pscrim'), cartp = $('#cartp'), searchEl = $('#search'), authEl = $('#auth');

  /* ---------- panel manager: one open at a time, focus trap, Esc, scroll lock ---------- */
  let current = null, returnTo = null;
  const focusables = el => [...el.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea')].filter(e => e.getClientRects().length);
  function open(el, focusEl) {
    const prev = current ? returnTo : document.activeElement;
    if (current) close(true);
    returnTo = prev; current = el;
    el.classList.add('open'); scrim.classList.add('on'); document.body.style.overflow = 'hidden';
    setTimeout(() => (focusEl || el).focus(), 60);
  }
  function close(silent) {
    if (!current) return;
    current.classList.remove('open'); scrim.classList.remove('on'); document.body.style.overflow = '';
    const r = returnTo; current = null; if (!silent && r && r.focus) r.focus();
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target === scrim) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closePop(); close(); }
    if (e.key === 'Tab' && current) {
      const f = focusables(current); if (!f.length) return;
      const first = f[0], last = f[f.length - 1], a = document.activeElement;
      if (e.shiftKey && (a === first || a === current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- toast (optionally with an action button) ---------- */
  const toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.append(toast);
  let tt;
  UI.toast = (msg, action) => {
    toast.innerHTML = `<span>${esc(msg)}</span>` + (action ? `<button type="button">${esc(action.label)}</button>` : '');
    if (action) toast.querySelector('button').onclick = () => { toast.classList.remove('on'); action.fn(); };
    toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('on'), 3400);
  };

  /* ---------- cart ---------- */
  const cb = $('#cb'), cf = $('#cf');
  UI.openCart = () => open(cartp);
  function renderCart() {
    const ls = S.lines(), t = S.totals();
    cb.innerHTML = ls.length ? `<ul>${ls.map(({ p, qty }) => `
      <li class="ci" data-id="${p.id}">
        <div class="th">${window.productMedia(p, true)}</div>
        <div><b>${esc(p.name)}</b><small>${esc(p.brand)}</small>
          <div class="qty"><button type="button" data-q="-1" aria-label="Decrease quantity of ${esc(p.name)}">−</button><span aria-label="Quantity">${qty}</span><button type="button" data-q="1" aria-label="Increase quantity of ${esc(p.name)}">+</button></div></div>
        <div class="rt"><b>${S.gbp(p.price * qty)}</b><button type="button" class="rm" data-rm aria-label="Remove ${esc(p.name)}">Remove</button></div>
      </li>`).join('')}</ul>`
      : `<div class="empty"><p style="font-size:18px;font-weight:700;color:var(--bark)">Your bag is empty</p><p>Your next personal best is waiting — add something for the run.</p><p style="margin-top:20px"><a class="btn b-k" href="footwear.html">Shop footwear →</a></p></div>`;
    cf.hidden = !ls.length;
    if (!ls.length) return;
    cf.innerHTML = `
      <div class="ship"><p>${t.free ? 'You\'ve unlocked <b>free UK delivery</b> — nice one.' : `You're <b>${S.gbp(t.away)}</b> away from free UK delivery.`}</p><div class="bar"><i style="width:${Math.min(100, t.sub / 75 * 100)}%"></i></div></div>
      <form class="promo" id="promo" novalidate>${t.code
        ? `<p class="ok">Code <b>${esc(t.code)}</b> applied (−${S.gbp(t.disc)}) <button type="button" data-unpromo>Remove</button></p>`
        : `<label class="sr" for="pc">Promo code</label><input id="pc" placeholder="Promo code (try WELCOME10)" autocomplete="off"><button>Apply</button>`}<span class="pm" role="status"></span></form>
      <div class="sum"><div class="row"><span>Subtotal</span><b>${S.gbp(t.sub)}</b></div>${t.disc ? `<div class="row"><span>Discount</span><b>−${S.gbp(t.disc)}</b></div>` : ''}
        <div class="row"><span>Delivery</span><b>${t.free ? 'Free' : 'from £4.95'}</b></div></div>
      <a class="btn b-k" href="checkout.html" style="width:100%;justify-content:center;margin-top:14px">Checkout →</a>
      <button type="button" class="rm cs-btn" data-close>Continue shopping</button>`;
  }
  cartp.addEventListener('click', e => {
    const li = e.target.closest('.ci'), q = e.target.closest('[data-q]');
    if (q && li) { const d = +q.dataset.q, l = S.lines().find(x => x.p.id === li.dataset.id); S.setQty(li.dataset.id, l.qty + d);
      const again = cb.querySelector(`[data-id="${li.dataset.id}"] [data-q="${d}"]`); if (again) again.focus(); }
    if (e.target.closest('[data-rm]') && li) { S.remove(li.dataset.id); UI.toast('Removed from your bag.'); }
    if (e.target.closest('[data-unpromo]')) S.dropPromo();
  });
  cartp.addEventListener('submit', e => {
    if (e.target.id !== 'promo') return; e.preventDefault();
    const v = $('#pc').value, pm = e.target.querySelector('.pm');
    if (!S.applyPromo(v)) { pm.textContent = v.trim() ? 'Sorry, that code isn\'t valid.' : 'Enter a code first.'; pm.style.color = 'var(--terra)'; }
  });
  cbtn.addEventListener('click', () => open(cartp));
  let prev = S.count();
  function badge() {
    const n = S.count(); cnt.textContent = n; cnt.hidden = !n;
    cbtn.setAttribute('aria-label', `Cart, ${n} item${n === 1 ? '' : 's'}`);
    if (n > prev) { cnt.classList.remove('bump'); void cnt.offsetWidth; cnt.classList.add('bump'); }
    prev = n;
  }
  S.on('cart', () => { badge(); renderCart(); });
  badge(); renderCart();

  // Any button with data-add + data-id adds that product to the bag (works on every page)
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    const p = S.product(b.dataset.id); if (!p) return;
    S.add(p.id);
    const t = b.textContent; if (b.classList.contains('add') && !b.classList.contains('done')) { b.textContent = 'Added ✓'; b.classList.add('done'); setTimeout(() => { b.textContent = t; b.classList.remove('done'); }, 1400); }
    UI.toast(`${p.name} added — great choice, now go run!`, { label: 'View bag', fn: () => open(cartp) });
  });

  /* ---------- search ---------- */
  const sq = $('#sq'), sres = $('#sres'), POP = ['trail', 'jacket', 'shoes', 'women', 'men', 'hoka', 'watch', 'sale'];
  function renderSearch() {
    const q = sq.value.trim();
    if (!q) { sres.innerHTML = `<p class="hint">Popular searches</p><div class="chips">${POP.map(c => `<button type="button" data-chip="${c}">${c}</button>`).join('')}</div>`; return; }
    const r = window.searchProducts(q);
    if (!r.length) { sres.innerHTML = `<p class="hint">No results for “${esc(q)}”. Try “jacket”, “trail” or a brand like Hoka.</p>`; return; }
    sres.innerHTML = `<p class="hint">${r.length} result${r.length === 1 ? '' : 's'}</p><ul class="rl">${r.slice(0, 6).map(p => `
      <li><a href="search.html?q=${encodeURIComponent(p.name)}"><span class="th">${window.productMedia(p, true)}</span><span class="tx"><b>${esc(p.name)}</b><small>${esc(p.brand)} · ${esc(p.group)}</small></span><span class="pz">${S.gbp(p.price)}</span></a>
      <button type="button" class="add" data-add data-id="${p.id}" aria-label="Add ${esc(p.name)} to bag">Add</button></li>`).join('')}</ul>
      <a class="btn b-d all" href="search.html?q=${encodeURIComponent(q)}">See all ${r.length} results →</a>`;
  }
  sbtn.setAttribute('aria-haspopup', 'dialog');
  sbtn.addEventListener('click', () => { open(searchEl, sq); renderSearch(); });
  sq.addEventListener('input', renderSearch);
  sres.addEventListener('click', e => { const c = e.target.closest('[data-chip]'); if (c) { sq.value = c.dataset.chip; renderSearch(); sq.focus(); } });
  $('#sform').addEventListener('submit', e => { e.preventDefault(); const q = sq.value.trim(); if (q) location.href = 'search.html?q=' + encodeURIComponent(q); });

  /* ---------- log in / sign up ---------- */
  let mode = 'login', after = null;
  const aform = $('#aform'), aerr = $('#aerr'), asub = $('#asub');
  function setMode(m) {
    mode = m;
    $('#tl').setAttribute('aria-selected', m === 'login'); $('#ts').setAttribute('aria-selected', m === 'signup');
    $('#fname').hidden = m !== 'signup';
    $('#at').textContent = m === 'login' ? 'Welcome back' : 'Join the Paceline club';
    asub.textContent = m === 'login' ? 'Log in' : 'Create account';
    $('#apw').autocomplete = m === 'login' ? 'current-password' : 'new-password';
    $('#apwh').textContent = m === 'signup' ? 'At least 8 characters.' : '';
    aerr.textContent = '';
  }
  UI.login = (m = 'login', cb2) => { setMode(m); after = cb2 || null; open(authEl, m === 'signup' ? $('#aname') : $('#aemail')); };
  authEl.addEventListener('click', e => { const t = e.target.closest('[data-mode]'); if (t) setMode(t.dataset.mode); });
  $('#show').addEventListener('change', e => { $('#apw').type = e.target.checked ? 'text' : 'password'; });
  aform.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#aname').value.trim(), email = $('#aemail').value.trim(), pw = $('#apw').value;
    const bad = (msg, id) => { aerr.textContent = msg; ['aname', 'aemail', 'apw'].forEach(x => $('#' + x).setAttribute('aria-invalid', x === id)); $('#' + id).focus(); };
    if (mode === 'signup' && name.length < 2) return bad('Please enter your name.', 'aname');
    if (!EMAIL.test(email)) return bad('Please enter a valid email address.', 'aemail');
    if (mode === 'signup' ? pw.length < 8 : !pw) return bad(mode === 'signup' ? 'Choose a password with at least 8 characters.' : 'Please enter your password.', 'apw');
    aerr.textContent = ''; ['aname', 'aemail', 'apw'].forEach(x => $('#' + x).setAttribute('aria-invalid', 'false'));
    asub.disabled = true;
    const r = mode === 'login' ? await S.login(email, pw) : await S.register(name, email, pw);
    asub.disabled = false;
    if (r.error) return bad(r.error, mode === 'login' ? 'apw' : 'aemail');
    const u = S.user(); aform.reset(); $('#apw').type = 'password'; close();
    UI.toast(`${mode === 'login' ? 'Welcome back' : 'Welcome to the club'}, ${u.name.split(' ')[0]} — let's run!`);
    if (after) { const f = after; after = null; f(); }
  });

  /* ---------- account button + menu ---------- */
  const pop = document.createElement('div'); pop.className = 'pop'; pop.hidden = true; pop.setAttribute('role', 'menu'); hdr.append(pop);
  function closePop() { if (pop.hidden) return; pop.hidden = true; abtn.setAttribute('aria-expanded', 'false'); }
  function renderAcct() {
    const u = S.user();
    abtn.innerHTML = u ? `<span class="avatar">${esc(u.name.trim()[0].toUpperCase())}</span>` : iconAcct;
    abtn.setAttribute('aria-label', u ? `Account menu for ${u.name}` : 'Log in or sign up');
    abtn.setAttribute('aria-haspopup', u ? 'menu' : 'dialog'); abtn.setAttribute('aria-expanded', 'false'); pop.hidden = true;
  }
  abtn.addEventListener('click', () => {
    const u = S.user(); if (!u) return UI.login('login');
    if (!pop.hidden) return closePop();
    pop.innerHTML = `<p><b>Hi, ${esc(u.name.split(' ')[0])}</b><small>${esc(u.email)}</small></p>
      <a role="menuitem" href="account.html">My account</a><a role="menuitem" href="account.html#bookings">My gait bookings</a>
      <a role="menuitem" href="gait.html">Book gait analysis</a><button role="menuitem" type="button" id="lo">Log out</button>`;
    pop.hidden = false; abtn.setAttribute('aria-expanded', 'true'); pop.querySelector('a').focus();
    $('#lo').onclick = () => { S.logout(); UI.toast("You've been logged out. See you on the next run!"); abtn.focus(); };
  });
  document.addEventListener('click', e => { if (!pop.hidden && !pop.contains(e.target) && !abtn.contains(e.target)) closePop(); });
  S.on('auth', renderAcct); renderAcct();
})();
