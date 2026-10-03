/* PACELINE – client-side data layer (cart, accounts, bookings, orders).
   Everything lives in localStorage, so it persists across pages and visits in THIS browser only.
   This is a front-end demo: there is no server, no real payments and no real email. */
(() => {
  'use strict';

  /* ---------- storage (falls back to memory if localStorage is blocked) ---------- */
  const mem = {};
  const read = (k, d) => {
    if (k in mem) return mem[k];
    try { const v = localStorage.getItem('pl_' + k); return v ? JSON.parse(v) : d; } catch { return d; }
  };
  const write = (k, v) => { try { localStorage.setItem('pl_' + k, JSON.stringify(v)); } catch { mem[k] = v; } };

  /* ---------- tiny event bus (also fires when another tab changes data) ---------- */
  const subs = {};
  const on = (n, f) => (subs[n] ||= []).push(f);
  const emit = n => (subs[n] || []).forEach(f => f());
  addEventListener('storage', e => e.key && e.key.startsWith('pl_') && emit(e.key.slice(3)));

  /* ---------- helpers ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const gbp = n => '£' + (Math.round(n * 100) % 100 === 0 ? String(Math.round(n)) : n.toFixed(2));
  const ref = p => p + '-' + Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  const product = id => (window.PRODUCTS || []).find(p => p.id === id);
  const fmtDate = iso => { const [y, m, d] = iso.split('-').map(Number); return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, d)); };
  // Show / clear a field error: expects <input id="x"> and <span id="e-x">
  const setErr = (id, msg) => {
    const e = document.getElementById('e-' + id), i = document.getElementById(id);
    if (e) e.textContent = msg || '';
    if (i) i.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !!msg;
  };

  /* ---------- cart ---------- */
  const cart = () => read('cart', []);
  const saveCart = c => { write('cart', c); emit('cart'); };
  const add = (id, n = 1) => { const c = cart(), l = c.find(x => x.id === id); l ? (l.qty = Math.min(10, l.qty + n)) : c.push({ id, qty: n }); saveCart(c); };
  const setQty = (id, q) => { let c = cart(); const l = c.find(x => x.id === id); if (!l) return; q <= 0 ? (c = c.filter(x => x !== l)) : (l.qty = Math.min(10, q)); saveCart(c); };
  const remove = id => saveCart(cart().filter(x => x.id !== id));
  const clear = () => { write('cart', []); write('promo', null); emit('cart'); };
  const lines = () => cart().map(l => ({ p: product(l.id), qty: l.qty })).filter(l => l.p);
  const count = () => lines().reduce((s, l) => s + l.qty, 0);

  const PROMOS = { WELCOME10: 0.1 };            // 10% off
  const promo = () => read('promo', null);
  const applyPromo = code => { const c = String(code).trim().toUpperCase(); if (!PROMOS[c]) return false; write('promo', c); emit('cart'); return true; };
  const dropPromo = () => { write('promo', null); emit('cart'); };
  const totals = (method = 'standard') => {
    const ls = lines(), sub = ls.reduce((s, l) => s + l.p.price * l.qty, 0);
    const code = promo(), disc = code && PROMOS[code] ? Math.round(sub * PROMOS[code] * 100) / 100 : 0;
    const free = sub >= 75;                      // free standard UK delivery over £75
    const delivery = !ls.length ? 0 : method === 'express' ? 8.95 : free ? 0 : 4.95;
    return { sub, disc, code, free, delivery, away: Math.max(0, 75 - sub), total: Math.round((sub - disc + delivery) * 100) / 100 };
  };

  /* ---------- accounts (demo: salted SHA-256 hash in localStorage – NOT production security) ---------- */
  const users = () => read('users', {});
  const uid = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2, '0')).join('');
  async function hash(s) {
    if (window.crypto && crypto.subtle) {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) | 0; return 'x' + (h >>> 0).toString(16);
  }
  const user = () => { const e = read('session', null), u = e && users()[e]; return u ? { name: u.name, email: e } : null; };
  async function register(name, email, pw) {
    email = email.trim().toLowerCase(); const us = users();
    if (us[email]) return { error: 'An account with this email already exists — try logging in.' };
    const salt = uid(); us[email] = { name: name.trim(), salt, h: await hash(salt + pw) };
    write('users', us); write('session', email); emit('auth'); return { ok: true };
  }
  async function login(email, pw) {
    email = email.trim().toLowerCase(); const u = users()[email];
    if (!u || u.h !== await hash(u.salt + pw)) return { error: 'Email or password is incorrect.' };
    write('session', email); emit('auth'); return { ok: true };
  }
  const logout = () => { write('session', null); emit('auth'); };
  const mine = list => { const u = user(); return u ? list.filter(x => (x.email || '').toLowerCase() === u.email) : []; };

  /* ---------- gait-analysis bookings ---------- */
  const bookings = () => read('bookings', []);
  const taken = (date, time) => bookings().some(b => b.date === date && b.time === time && b.status === 'confirmed');
  const addBooking = b => { const l = bookings(); l.push(b); write('bookings', l); emit('bookings'); };
  const cancelBooking = r => { const l = bookings(), b = l.find(x => x.ref === r); if (b) { b.status = 'cancelled'; write('bookings', l); emit('bookings'); } };
  // Calendar file (.ics) so the booking can be added to any calendar app
  const ics = b => {
    const day = b.date.replace(/-/g, ''), [h, m] = b.time.split(':').map(Number);
    const end = String(h + Math.floor((m + 45) / 60)).padStart(2, '0') + String((m + 45) % 60).padStart(2, '0') + '00';
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Paceline//Gait Analysis//EN', 'BEGIN:VEVENT', 'UID:' + b.ref + '@paceline',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''), 'DTSTART:' + day + 'T' + b.time.replace(':', '') + '00', 'DTEND:' + day + 'T' + end,
      'SUMMARY:Paceline gait analysis', 'LOCATION:Paceline\\, Great Western Road\\, Glasgow', 'DESCRIPTION:Booking ref ' + b.ref + '. Bring your current running shoes.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  };
  const downloadICS = b => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics(b)], { type: 'text/calendar' }));
    a.download = 'paceline-gait-analysis.ics'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  /* ---------- orders ---------- */
  const orders = () => read('orders', []);
  const addOrder = o => { const l = orders(); l.push(o); write('orders', l); emit('orders'); };

  window.Store = { on, emit, esc, gbp, ref, product, fmtDate, setErr, add, setQty, remove, clear, lines, count, promo, applyPromo, dropPromo, totals,
    user, register, login, logout, mine, bookings, taken, addBooking, cancelBooking, downloadICS, orders, addOrder };
})();
