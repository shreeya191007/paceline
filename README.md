# Paceline – running store website (HTML / CSS / JS, no build step)

Run locally (pick one):
    python3 -m http.server 8000      # then open http://localhost:8000
    npx serve .                      # alternative, needs Node.js

Pages: index · about · men · women · footwear · apparel · brands · sale · search · gait · account · checkout (.html)
Code:  css/style.css
       js/store.js    cart, accounts, bookings, orders (localStorage)
       js/products.js product catalog, illustrations, search
       js/main.js     header/footer, nav drawer, hero slider
       js/ui.js       cart drawer, search overlay, login modal, account menu, toasts
       js/shop.js · gait.js · account.js · checkout.js   page-specific logic

Demo notes: all data is stored in this browser's localStorage. There is no server, no real payment and no real email.
Promo code to try: WELCOME10 (10% off).
To add a product, add one line to PRODUCTS in js/products.js.
