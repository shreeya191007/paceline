/* PACELINE – "My account": profile, gait bookings (cancel / add to calendar) and order history. */
(() => {
  'use strict';
  const S = window.Store, $ = (s, r = document) => r.querySelector(s), esc = S.esc, root = $('#acc');
  const todayISO = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();

  function render() {
    const u = S.user();
    if (!u) {
      root.innerHTML = `<div class="gcard conf"><h2>Log in to see your account</h2><p>Your bookings and orders live here once you're signed in.</p>
        <div class="acts"><button class="btn b-k" data-login>Log in</button><button class="btn b-d" data-signup>Create account</button></div></div>`;
      return;
    }
    const bks = S.mine(S.bookings()).sort((a, b) => b.created - a.created);
    const ords = S.mine(S.orders()).sort((a, b) => b.date - a.date);
    root.innerHTML = `
      <div class="prof"><div><h2>Hi, ${esc(u.name.split(' ')[0])}</h2><p>${esc(u.email)}</p></div><button class="btn b-d" data-logout>Log out</button></div>
      <section id="bookings" class="acc-s"><h2>My gait analysis bookings</h2>
        ${bks.length ? `<ul class="alist">${bks.map(b => {
          const past = b.date < todayISO, st = b.status === 'cancelled' ? 'cancelled' : past ? 'completed' : 'confirmed';
          return `<li class="ar"><div><h3>${esc(S.fmtDate(b.date))} · ${b.time}</h3><p>Ref ${b.ref}${b.goal ? ' · ' + esc(b.goal) : ''}</p></div>
            <div class="acts"><span class="st ${st === 'cancelled' ? 'x' : ''}">${st}</span>
            ${st === 'confirmed' ? `<button class="btn b-d sm" data-ics="${b.ref}">Add to calendar</button><button class="btn b-d sm" data-cancel="${b.ref}">Cancel</button>` : ''}</div></li>`; }).join('')}</ul>`
          : `<p class="none">No bookings yet — a free 45-minute gait analysis could be your best investment this season.</p>`}
        <p style="margin-top:20px"><a class="btn b-k" href="gait.html">Book gait analysis →</a></p></section>
      <section id="orders" class="acc-s"><h2>My orders</h2>
        ${ords.length ? `<ul class="alist">${ords.map(o => `<li class="ar"><div><h3>Order ${o.ref}</h3><p>${new Date(o.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · ${o.items.map(i => esc(i.name) + ' × ' + i.qty).join(', ')}</p></div>
          <div class="acts"><b>${S.gbp(o.total)}</b><span class="st">${o.status}</span></div></li>`).join('')}</ul>`
          : `<p class="none">No orders yet. Your first pair is waiting.</p><p style="margin-top:20px"><a class="btn b-k" href="footwear.html">Shop footwear →</a></p>`}</section>`;
  }

  root.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.login !== undefined) window.UI.login('login');
    if (t.dataset.signup !== undefined) window.UI.login('signup');
    if (t.dataset.logout !== undefined) { S.logout(); window.UI.toast("You've been logged out. See you on the next run!"); }
    if (t.dataset.cancel) { if (confirm('Cancel this booking?')) { S.cancelBooking(t.dataset.cancel); window.UI.toast('Booking cancelled.'); } }
    if (t.dataset.ics) S.downloadICS(S.bookings().find(b => b.ref === t.dataset.ics));
  });
  ['auth', 'bookings', 'orders'].forEach(n => S.on(n, render));
  render();
  if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300); }
})();
