# Paceline – running store website (HTML / CSS / JS)

Run locally (pick one):
    python3 -m http.server 8000      # then open http://localhost:8000
    npx serve .                      # alternative, needs Node.js

Pages: index.html (Home) · about.html · men.html · women.html · footwear.html · apparel.html · brands.html · sale.html
Code:  css/style.css · js/main.js (nav/footer/slider) · js/products.js (catalog + illustrations) · js/shop.js (grids, filters, cart)
Images: src/Home/* · src/About/* (WebP)
To add a product, add one line to the PRODUCTS list in js/products.js – every page picks it up.
