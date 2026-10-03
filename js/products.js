/* PACELINE – product catalog and illustrations.
   Shoes reuse the supplied shoe photo (tinted per colourway); every other item is a lightweight inline SVG
   drawn in the earthy palette, so no extra image downloads are needed. */
(() => {
  'use strict';
  // Earthy colour pairs: [main, shade]
  const C = {
    olive: ['#7c8a4a', '#5d6b36'], terra: ['#c4572f', '#9c4122'], ochre: ['#d1913c', '#a8712a'],
    bark: ['#5a4636', '#3b2d22'], sand: ['#cdbb98', '#a99673'], moss: ['#4b5a2c', '#34401e'],
    slate: ['#5d6b66', '#434e4a'], clay: ['#a0623f', '#7b4a30']
  };
  // g: m = men, w = women, u = unisex. was = original price (item is on sale). c = colour (shoes: photo tint index)
  const P = (brand, name, group, kind, g, price, c, o = {}) => ({ brand, name, group, kind, g, price, c, ...o });
  window.PRODUCTS = [
    // ---- Shoes ----
    P('ON', 'Cloudmonster 3 — Hyper Lily', 'Shoes', 'shoe', 'u', 210, 0, { tag: 'NEW' }),
    P('Nike', 'Vaporfly 4 — Volt Ice', 'Shoes', 'shoe', 'm', 240, 1, { tag: 'NEW' }),
    P('Hoka', 'Tecton X 4 — Frost / Tangerine', 'Shoes', 'shoe', 'w', 220, 2, { tag: 'NEW' }),
    P('Asics', 'Megablast — White / Orange Glow', 'Shoes', 'shoe', 'u', 210, 3, { was: 260 }),
    P('Brooks', 'Ghost Trail 16 — Moss', 'Shoes', 'shoe', 'm', 150, 2),
    P('Saucony', 'Endorphin Speed 5 — Clay', 'Shoes', 'shoe', 'w', 190, 0),
    P('Salomon', 'Speedcross 7 — Bark', 'Shoes', 'shoe', 'm', 135, 3),
    P('Altra', 'Lone Peak 9 — Sunbaked', 'Shoes', 'shoe', 'w', 140, 1, { was: 175 }),
    P('New Balance', 'Fresh Foam 1080 — Sand', 'Shoes', 'shoe', 'm', 165, 0),
    P('Hoka', 'Clifton 10 — Sage', 'Shoes', 'shoe', 'w', 145, 2),
    // ---- Jackets ----
    P('Paceline', 'Trail Shell Jacket — Olive', 'Jackets', 'jacket', 'u', 120, C.olive, { tag: 'NEW' }),
    P('Nike', 'Windrunner Jacket — Terracotta', 'Jackets', 'jacket', 'm', 95, C.terra),
    P('Patagonia', 'Houdini Wind Jacket — Ochre', 'Jackets', 'jacket', 'w', 129, C.ochre),
    P('Salomon', 'Bonatti Waterproof — Bark', 'Jackets', 'jacket', 'm', 150, C.bark, { was: 190 }),
    P('ON', 'Weather Jacket — Slate', 'Jackets', 'jacket', 'w', 220, C.slate),
    P('Paceline', 'Fleece Layer — Sand', 'Jackets', 'jacket', 'u', 85, C.sand),
    P('Paceline', 'Insulated Gilet — Moss', 'Jackets', 'vest', 'm', 75, C.moss, { was: 95 }),
    // ---- Tops ----
    P('Paceline', 'Merino Tee — Clay', 'Tops', 'tee', 'm', 45, C.clay, { tag: 'NEW' }),
    P('Nike', 'Race-Day Singlet — Ochre', 'Tops', 'tee', 'm', 35, C.ochre),
    P('Brooks', 'Distance Long Sleeve — Slate', 'Tops', 'tee', 'w', 55, C.slate),
    P('Nike', 'Dri-FIT Tee — Terracotta', 'Tops', 'tee', 'w', 32, C.terra, { was: 40 }),
    P('Paceline', 'Crop Run Top — Moss', 'Tops', 'tee', 'w', 38, C.moss),
    P('Brooks', 'Distance Tee — Olive', 'Tops', 'tee', 'm', 40, C.olive),
    // ---- Bottoms ----
    P('Nike', 'Run Shorts 5-inch — Slate', 'Bottoms', 'shorts', 'm', 40, C.slate),
    P('Brooks', '2-in-1 Shorts — Bark', 'Bottoms', 'shorts', 'm', 48, C.bark),
    P('Paceline', 'High-Rise Tights — Olive', 'Bottoms', 'tights', 'w', 65, C.olive, { tag: 'NEW' }),
    P('Salomon', 'Thermal Tights — Bark', 'Bottoms', 'tights', 'm', 70, C.bark, { was: 90 }),
    P('Patagonia', 'Trail Shorts — Clay', 'Bottoms', 'shorts', 'w', 42, C.clay),
    P('Paceline', 'Everyday Joggers — Sand', 'Bottoms', 'tights', 'u', 60, C.sand),
    // ---- Accessories ----
    P('Garmin', 'Forerunner 265 — Sand', 'Accessories', 'watch', 'u', 399, C.sand, { tag: 'NEW' }),
    P('Coros', 'Pace 3 GPS Watch — Moss', 'Accessories', 'watch', 'u', 229, C.moss, { was: 249 }),
    P('Paceline', 'Run Cap — Terracotta', 'Accessories', 'cap', 'u', 22, C.terra),
    P('Salomon', 'Hydration Vest 5L — Olive', 'Accessories', 'pack', 'u', 110, C.olive),
    P('Salomon', 'Soft Flask 500ml — Ochre', 'Accessories', 'bottle', 'u', 18, C.ochre),
    P('Paceline', 'Merino Run Socks (2 pack)', 'Accessories', 'socks', 'u', 18, C.clay),
    P('Patagonia', 'Trail Pack 12L — Ochre', 'Accessories', 'pack', 'u', 95, C.ochre, { was: 120 }),
    P('Nike', 'Run Cap — Sand', 'Accessories', 'cap', 'u', 24, C.sand)
  ];

  window.PRODUCTS.forEach((p, i) => { p.id = 'p' + i; p.i = i; });

  // Tints applied to the shoe photo so each colourway looks distinct
  window.SHOE_FILTERS = ['none', 'hue-rotate(28deg) saturate(.9)', 'hue-rotate(-22deg) saturate(1.05)', 'sepia(.45) saturate(.85) hue-rotate(-8deg)'];

  const BG = ['#efe3cc', '#e8dcc0', '#e2d6b8', '#efdcc0'];
  /* Returns an SVG string for a given product (index i varies the background) */
  window.artSVG = (p, i, deco) => {
    const [a, b] = p.c; let s = '';
    switch (p.kind) {
      case 'jacket': s = `<path fill="${a}" d="M95 70 L130 55 Q156 72 183 55 L218 70 L262 195 L230 208 L212 150 L212 285 L100 285 L100 150 L82 208 L50 195Z"/><path fill="${b}" d="M130 55 Q156 74 183 55 L190 42 Q156 60 122 42Z"/><path stroke="${b}" stroke-width="3" fill="none" d="M156 68V285"/><path fill="${b}" opacity=".55" d="M112 220h34v8h-34zM166 220h34v8h-34z"/>`; break;
      case 'vest': s = `<path fill="${a}" d="M110 60 L135 52 Q156 70 177 52 L202 60 L212 110 L212 285 L100 285 L100 110Z"/><path fill="${b}" d="M135 52 Q156 72 177 52 L183 40 Q156 58 129 40Z"/><path stroke="${b}" stroke-width="3" fill="none" d="M156 66V285"/><path fill="${b}" opacity=".55" d="M112 215h34v8h-34zM166 215h34v8h-34z"/>`; break;
      case 'tee': s = `<path fill="${a}" d="M100 75 L135 62 Q156 82 177 62 L212 75 L255 120 L228 150 L208 130 L208 270 L104 270 L104 130 L84 150 L57 120Z"/><path fill="none" stroke="${b}" stroke-width="7" d="M135 62 Q156 82 177 62"/><circle cx="156" cy="150" r="12" fill="${b}" opacity=".5"/>`; break;
      case 'shorts': s = `<path fill="${a}" d="M95 100h122l18 155h-70l-9-85-9 85H77z"/><path fill="${b}" d="M95 100h122v18H95z"/><path stroke="${b}" stroke-width="3" d="M156 118v52"/>`; break;
      case 'tights': s = `<path fill="${a}" d="M100 70h112l10 215h-50l-16-150-16 150H90z"/><path fill="${b}" d="M100 70h112v20H100z"/>`; break;
      case 'cap': s = `<path fill="${a}" d="M80 190Q80 100 156 100Q232 100 232 190z"/><path fill="${b}" d="M70 190h190q10 26-25 30H90q-22-6-20-30z"/><circle cx="156" cy="104" r="7" fill="${b}"/>`; break;
      case 'watch': s = `<rect x="134" y="40" width="44" height="260" rx="16" fill="${b}"/><circle cx="156" cy="170" r="64" fill="${a}"/><circle cx="156" cy="170" r="50" fill="#1e1a14"/><path stroke="#c9d198" stroke-width="4" stroke-linecap="round" d="M156 170V140M156 170l22 12"/>`; break;
      case 'pack': s = `<rect x="95" y="60" width="122" height="225" rx="38" fill="${a}"/><path stroke="${b}" stroke-width="14" d="M118 64v221M194 64v221"/><rect x="128" y="190" width="56" height="58" rx="10" fill="${b}"/>`; break;
      case 'bottle': s = `<rect x="120" y="80" width="72" height="210" rx="22" fill="${a}"/><rect x="132" y="46" width="48" height="38" rx="8" fill="${b}"/><rect x="120" y="150" width="72" height="50" fill="${b}" opacity=".55"/>`; break;
      case 'socks': s = `<path fill="${a}" d="M115 50h70v140l60 40q17 32-13 50h-82q-30-10-35-50z"/><path fill="${b}" d="M115 50h70v30h-70z"/>`; break;
    }
    return `<svg viewBox="0 0 313 340" ${deco ? 'aria-hidden="true"' : `role="img" aria-label="${p.name}"`} xmlns="http://www.w3.org/2000/svg"><rect width="313" height="340" fill="${BG[i % 4]}"/><circle cx="156" cy="170" r="132" fill="#fff" opacity=".28"/><ellipse cx="156" cy="312" rx="88" ry="9" fill="#000" opacity=".12"/>${s}</svg>`;
  };

  /* Image/illustration markup for any product (deco = purely decorative, hidden from screen readers) */
  window.productMedia = (p, deco) => p.kind === 'shoe'
    ? `<img loading="lazy" src="src/Home/arrivals_section/image.webp" width="313" height="340" alt="${deco ? '' : p.name}" style="filter:${window.SHOE_FILTERS[p.c]}">`
    : window.artSVG(p, p.i, deco);

  /* Search: every word typed must match the start of a word in the name, brand, type, gender or "sale" */
  window.searchProducts = q => {
    const toks = String(q).toLowerCase().replace(/['’]/g, '').split(/[^a-z0-9]+/).filter(Boolean);
    if (!toks.length) return [];
    return window.PRODUCTS.filter(p => {
      const words = [p.name, p.brand, p.group, p.kind, p.tag || '', p.was ? 'sale discount' : '',
        p.g === 'm' ? 'men mens male' : p.g === 'w' ? 'women womens female ladies' : 'unisex']
        .join(' ').toLowerCase().replace(/['’]/g, '').split(/[^a-z0-9]+/);
      return toks.every(t => words.some(w => w.startsWith(t) || (t.endsWith('s') && w.startsWith(t.slice(0, -1)))));
    });
  };
})();
