/* PACELINE – renders product grids for Men, Women, Footwear, Apparel, Brands and Sale pages.
   Behaviour is driven by <body data-cat="..." data-filter="group|brand">. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const body = document.body, cat = body.dataset.cat, mode = body.dataset.filter || 'group';

  // Which products belong on which page
  const rules = {
    men: p => p.g !== 'w', women: p => p.g !== 'm',
    footwear: p => p.group === 'Shoes', apparel: p => p.group !== 'Shoes',
    sale: p => p.was, brands: () => true
  };
  const base = window.PRODUCTS.filter(rules[cat] || (() => true));
  const grid = $('#grid'), fl = $('#filters'), sortEl = $('#sort'), count = $('#count');
  let active = new URLSearchParams(location.search).get('type') || 'All';
  const values = ['All', ...new Set(base.map(p => p[mode]))];
  if (!values.includes(active)) active = 'All';

  const gbp = n => '£' + n.toLocaleString('en-GB');
  const heart = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/></svg>';

  function card(p, i) {
    const media = p.kind === 'shoe'
      ? `<img loading="lazy" src="src/Home/arrivals_section/image.webp" width="313" height="340" alt="${p.name}" style="filter:${window.SHOE_FILTERS[p.c]}">`
      : window.artSVG(p, i);
    const tag = p.was ? '<span class="tag s">SALE</span>' : p.tag ? `<span class="tag">${p.tag}</span>` : '';
    return `<article class="pc rise" style="animation-delay:${Math.min(i, 11) * 60}ms">
      <div class="ph">${tag}<button class="heart" aria-pressed="false" aria-label="Save ${p.name} to wishlist">${heart}</button>${media}</div>
      <small>${p.brand} · ${p.group}</small><h3>${p.name}</h3>
      <div class="pr"><b>${gbp(p.price)}</b>${p.was ? `<s>${gbp(p.was)}</s><em>Save ${Math.round((1 - p.price / p.was) * 100)}%</em>` : ''}</div>
      <button class="add" data-name="${p.name}">Add to bag</button></article>`;
  }

  function render() {
    let list = base.filter(p => active === 'All' || p[mode] === active);
    const s = sortEl.value;
    if (s === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (s === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (s === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    grid.innerHTML = list.map(card).join('');
    count.textContent = `Showing ${list.length} item${list.length === 1 ? '' : 's'}`;
  }

  fl.innerHTML = values.map(v => `<button aria-pressed="${v === active}" data-v="${v}">${v}</button>`).join('');
  fl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    active = b.dataset.v;
    fl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    render();
  });
  sortEl.addEventListener('change', render);

  // Toast + cart counter
  const toast = document.createElement('div');
  toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.append(toast);
  let tt, n = 2;
  grid.addEventListener('click', e => {
    const h = e.target.closest('.heart');
    if (h) return h.setAttribute('aria-pressed', h.getAttribute('aria-pressed') !== 'true');
    const b = e.target.closest('.add'); if (!b) return;
    n++; const c = $('#cnt');
    c.textContent = n; $('#cart').setAttribute('aria-label', `Cart, ${n} items`);
    c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    b.textContent = 'Added ✓'; b.classList.add('done'); setTimeout(() => { b.textContent = 'Add to bag'; b.classList.remove('done'); }, 1500);
    toast.textContent = `${b.dataset.name} added — great choice, now go run!`; toast.classList.add('on');
    clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('on'), 2400);
  });

  render();
})();
