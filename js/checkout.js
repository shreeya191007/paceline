/* PACELINE – checkout: delivery details, delivery method, live order summary, place order (demo – no payment taken). */
(() => {
  'use strict';
  const S = window.Store, $ = (s, r = document) => r.querySelector(s), esc = S.esc;
  const form = $('#cform'), layout = $('#co'), empty = $('#cempty'), done = $('#cdone'), sum = $('#csum'), btn = $('#place');
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, POST = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/;
  let placed = false;
  const method = () => form.elements.method.value;

  function renderSummary() {
    if (placed) return;
    const ls = S.lines();
    layout.hidden = !ls.length; empty.hidden = !!ls.length;
    if (!ls.length) return;
    const t = S.totals(method());
    sum.innerHTML = `<h2>Order summary</h2><ul>${ls.map(({ p, qty }) => `<li class="ci"><div class="th">${window.productMedia(p, true)}</div><div><b>${esc(p.name)}</b><small>${esc(p.brand)} · Qty ${qty}</small></div><div class="rt"><b>${S.gbp(p.price * qty)}</b></div></li>`).join('')}</ul>
      <div class="sum"><div class="row"><span>Subtotal</span><b>${S.gbp(t.sub)}</b></div>
      ${t.disc ? `<div class="row"><span>Discount (${esc(t.code)})</span><b>−${S.gbp(t.disc)}</b></div>` : ''}
      <div class="row"><span>Delivery</span><b>${t.delivery ? S.gbp(t.delivery) : 'Free'}</b></div>
      <div class="row tot"><span>Total</span><b>${S.gbp(t.total)}</b></div></div>
      <button type="button" class="rm" id="edit">Edit bag</button>`;
    btn.textContent = `Place order · ${S.gbp(t.total)}`;
    $('#d-std').textContent = t.free ? 'Free' : '£4.95';
    $('#edit').onclick = () => window.UI.openCart();
  }
  S.on('cart', renderSummary);
  form.addEventListener('change', e => { if (e.target.name === 'method') renderSummary(); });

  function prefill() { const u = S.user(); if (!u) return; if (!$('#name').value) $('#name').value = u.name; if (!$('#email').value) $('#email').value = u.email; }
  prefill(); S.on('auth', prefill);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = Object.fromEntries(['name', 'email', 'address', 'city', 'postcode'].map(k => [k, $('#' + k).value.trim()]));
    const errs = {};
    if (v.name.length < 2) errs.name = 'Please enter your name.';
    if (!EMAIL.test(v.email)) errs.email = 'Please enter a valid email address.';
    if (v.address.length < 5) errs.address = 'Please enter your street address.';
    if (v.city.length < 2) errs.city = 'Please enter your town or city.';
    if (!POST.test(v.postcode)) errs.postcode = 'Please enter a valid UK postcode, e.g. G12 8QQ.';
    ['name', 'email', 'address', 'city', 'postcode'].forEach(k => S.setErr(k, errs[k]));
    const keys = Object.keys(errs); if (keys.length) return $('#' + keys[0]).focus();
    const ls = S.lines(), t = S.totals(method());
    if (!ls.length) return;
    const o = { ref: S.ref('PL'), email: v.email.toLowerCase(), name: v.name, ship: `${v.address}, ${v.city}, ${v.postcode.toUpperCase()}`, method: method(), total: t.total, date: Date.now(), status: 'processing',
      items: ls.map(({ p, qty }) => ({ id: p.id, name: p.name, qty, price: p.price })) };
    placed = true; S.addOrder(o); S.clear();
    layout.hidden = true; done.hidden = false;
    done.innerHTML = `<div class="tick" aria-hidden="true">✓</div><h2>Thank you, ${esc(v.name.split(' ')[0])}!</h2><p>Your order is in. Every mile starts with a first step — yours is on its way.</p>
      <dl><dt>Order</dt><dd>${o.ref}</dd><dt>Total</dt><dd>${S.gbp(o.total)}</dd><dt>Delivering to</dt><dd>${esc(o.ship)}</dd></dl>
      <p class="note">This is a demo shop — nothing was charged or shipped.</p>
      <div class="acts"><a class="btn b-k" href="account.html#orders">View my orders</a><a class="btn b-d" href="index.html">Keep exploring</a></div>`;
    done.focus(); scrollTo({ top: 0, behavior: 'smooth' });
  });
  renderSummary();
})();
