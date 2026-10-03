/* PACELINE – renders product grids for Men, Women, Footwear, Apparel, Brands, Sale and Search.
   Driven by <body data-cat="..." data-filter="group|brand">. "Add to bag" is handled globally in ui.js. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), S = window.Store;
  const cat = document.body.dataset.cat, mode = document.body.dataset.filter || 'group';
  const params = new URLSearchParams(location.search), query = (params.get('q') || '').trim();
  const hits = cat === 'search' ? new Set(window.searchProducts(query)) : null;

  // Which products belong on which page
  const rules = {
    men: p => p.g !== 'w', women: p => p.g !== 'm',
    footwear: p => p.group === 'Shoes', apparel: p => p.group !== 'Shoes',
    sale: p => p.was, brands: () => true, search: p => hits.has(p)
  };
  const base = window.PRODUCTS.filter(rules[cat] || (() => true));
  const grid = $('#grid'), fl = $('#filters'), sortEl = $('#sort'), count = $('#count');
  let active = params.get('type') || 'All';
  const values = ['All', ...new Set(base.map(p => p[mode]))];
  if (!values.includes(active)) active = 'All';

  if (cat === 'search') {                       // heading + caption for the search page
    $('#ptitle').textContent = query ? `Results for “${query}”` : 'Search';
    $('#pcap').textContent = !query ? 'Type something above to start.' : hits.size ? `${hits.size} product${hits.size === 1 ? '' : 's'} found.` : 'Nothing matched — try “jacket”, “trail” or a brand like Hoka.';
    document.title = (query ? `“${query}” — Search` : 'Search') + ' — Paceline';
    $('#sq2').value = query;
  }

  const heart = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/></svg>';
  function card(p, i) {
    const tag = p.was ? '<span class="tag s">SALE</span>' : p.tag ? `<span class="tag">${p.tag}</span>` : '';
    return `<article class="pc rise" style="animation-delay:${Math.min(i, 11) * 60}ms">
      <div class="ph">${tag}<button class="heart" aria-pressed="false" aria-label="Save ${p.name} to wishlist">${heart}</button>${window.productMedia(p)}</div>
      <small>${p.brand} · ${p.group}</small><h3>${p.name}</h3>
      <div class="pr"><b>${S.gbp(p.price)}</b>${p.was ? `<s>${S.gbp(p.was)}</s><em>Save ${Math.round((1 - p.price / p.was) * 100)}%</em>` : ''}</div>
      <button class="add" data-add data-id="${p.id}">Add to bag</button></article>`;
  }

  function render() {
    let list = base.filter(p => active === 'All' || p[mode] === active);
    const s = sortEl.value;
    if (s === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (s === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (s === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    grid.innerHTML = list.length ? list.map(card).join('')
      : `<p class="empty">${cat === 'search' ? 'No matching products. Try one of these:' : 'Nothing here yet.'}
         <span class="chips" style="justify-content:center;margin-top:16px">${['trail', 'jacket', 'shoes', 'women', 'hoka', 'sale'].map(c => `<a class="chipl" href="search.html?q=${c}">${c}</a>`).join('')}</span></p>`;
    count.textContent = list.length ? `Showing ${list.length} item${list.length === 1 ? '' : 's'}` : '';
  }

  fl.innerHTML = values.map(v => `<button aria-pressed="${v === active}" data-v="${v}">${v}</button>`).join('');
  fl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    active = b.dataset.v;
    fl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    render();
  });
  sortEl.addEventListener('change', render);
  grid.addEventListener('click', e => { const h = e.target.closest('.heart'); if (h) h.setAttribute('aria-pressed', h.getAttribute('aria-pressed') !== 'true'); });
  render();
})();
