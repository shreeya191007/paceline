/* PACELINE – gait analysis booking: pick a Saturday + time, validate, save, confirm, add to calendar, cancel. */
(() => {
  'use strict';
  const S = window.Store, $ = (s, r = document) => r.querySelector(s), esc = S.esc;
  const form = $('#gform'), done = $('#gdone'), datesEl = $('#dates'), timesEl = $('#times');
  const TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];     // 45-minute sessions
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const fmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  // The clinic runs on Saturdays: offer the next six
  const days = [], d = new Date(); d.setHours(0, 0, 0, 0);
  while (days.length < 6) { d.setDate(d.getDate() + 1); if (d.getDay() === 6) days.push(new Date(d)); }
  datesEl.innerHTML = days.map(x => `<label class="chip"><input type="radio" name="date" value="${iso(x)}"><span>${fmt.format(x)}</span></label>`).join('');

  // Time chips; a slot already booked in this browser is disabled for that date
  function renderTimes() {
    const date = form.elements.date.value, prev = timesEl.querySelector('input:checked');
    const keep = prev && prev.value;
    timesEl.innerHTML = TIMES.map(t => {
      const off = date && S.taken(date, t);
      return `<label class="chip"><input type="radio" name="time" value="${t}" ${off ? 'disabled' : ''} ${t === keep && !off ? 'checked' : ''}><span>${t}${off ? ' · booked' : ''}</span></label>`;
    }).join('');
  }
  renderTimes();
  datesEl.addEventListener('change', () => { renderTimes(); S.setErr('date', ''); });
  timesEl.addEventListener('change', () => S.setErr('time', ''));

  function prefill() {
    const u = S.user(); if (!u) return;
    if (!$('#name').value) $('#name').value = u.name;
    if (!$('#email').value) $('#email').value = u.email;
  }
  prefill(); S.on('auth', prefill);

  function validate() {
    const v = { name: $('#name').value.trim(), email: $('#email').value.trim(), phone: $('#phone').value.trim(), goal: $('#goal').value.trim() };
    const errs = {};
    if (v.name.length < 2) errs.name = 'Please enter your name.';
    if (!EMAIL.test(v.email)) errs.email = 'Please enter a valid email address.';
    if (v.phone && !/^[+\d][\d\s()-]{6,}$/.test(v.phone)) errs.phone = 'Please enter a valid phone number, or leave it blank.';
    if (!form.elements.date.value) errs.date = 'Please choose a Saturday.';
    if (!form.elements.time.value) errs.time = 'Please choose a time.';
    if (!$('#consent').checked) errs.consent = 'Please tick this box so we can contact you about your booking.';
    ['name', 'email', 'phone', 'date', 'time', 'consent'].forEach(k => S.setErr(k, errs[k]));
    return { errs, v };
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const { errs, v } = validate(), keys = Object.keys(errs);
    if (keys.length) { const k = keys[0]; ($('#' + k) || form.querySelector(`input[name="${k}"]:not(:disabled)`)).focus(); return; }
    const date = form.elements.date.value, time = form.elements.time.value;
    if (S.taken(date, time)) { renderTimes(); S.setErr('time', 'Sorry, that slot was just booked — please pick another.'); return; }
    const b = { ref: S.ref('GA'), name: v.name, email: v.email.toLowerCase(), phone: v.phone, exp: $('#exp').value, goal: v.goal, date, time, status: 'confirmed', created: Date.now() };
    S.addBooking(b); showDone(b);
  });

  function showDone(b) {
    const guest = !S.user();
    form.hidden = true; done.hidden = false;
    done.innerHTML = `<div class="tick" aria-hidden="true">✓</div><h2>You're booked in, ${esc(b.name.split(' ')[0])}!</h2>
      <p>One step closer to a smoother stride. We'll see you on the track.</p>
      <dl><dt>Reference</dt><dd>${b.ref}</dd><dt>When</dt><dd>${esc(S.fmtDate(b.date))} at ${b.time}</dd><dt>Where</dt><dd>Paceline, Great Western Road, Glasgow</dd><dt>Bring</dt><dd>Your current running shoes</dd></dl>
      <div class="acts"><button class="btn b-k" id="ics">Add to calendar</button><button class="btn b-d" id="cx">Cancel booking</button></div>
      ${guest ? `<p class="note">Want to see and manage your bookings any time? <button type="button" class="rm" id="mk">Create a free account</button> using the same email (${esc(b.email)}).</p>` : `<p class="note"><a href="account.html#bookings" class="rm">View in My account</a></p>`}
      <p class="note"><button type="button" class="rm" id="again">Book another session</button></p>`;
    done.focus();
    $('#ics').onclick = () => S.downloadICS(b);
    $('#cx').onclick = () => { if (!confirm('Cancel this booking?')) return; S.cancelBooking(b.ref); window.UI.toast('Booking cancelled. Rebook any time — we\'ll save you a spot.'); reset(); };
    $('#again').onclick = reset;
    const mk = $('#mk'); if (mk) mk.onclick = () => window.UI.login('signup');
  }
  function reset() { form.reset(); form.hidden = false; done.hidden = true; renderTimes(); prefill(); $('#dates input').focus(); }
})();
