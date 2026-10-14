SERENITY SPA — PROJECT NOTES
============================

1. HOW TO RUN
-------------
The header and footer are loaded with fetch(), which does not work when you
open index.html directly (file://). Use a local web server:

  VS Code Live Server
    a. Install the "Live Server" extension (Ritwick Dey).
    b. Open the Serenity-Spa folder in VS Code.
    c. Right-click index.html and choose "Open with Live Server".

  Or, with Python installed:
    cd Serenity-Spa
    python -m http.server 8000
    then open http://localhost:8000

An internet connection is needed for Tailwind CSS (CDN), Font Awesome and
Google Fonts.


2. IMAGES (ALREADY INCLUDED)
---------------------------
All photos are in assets/images/. They were cropped and resized from the
pictures supplied by the site owner.

  spa-hero.jpg          Banner 1: sunset over an infinity pool
  spa-hero-2.jpg        Banner 2: arched relaxation lounge
  spa-hero-3.jpg        Banner 3: oil massage with candles
  spa-about.jpg         About section: therapist giving a facial massage
  massage.jpg           Treatment card: head massage
  facial.jpg            Treatment card: face mask and towel wrap
  aromatherapy.jpg      Treatment card: essential oils and lavender
  body-treatment.jpg    Treatment card: oil massage with candles
  spa-interior.jpg      Experience section: arched relaxation lounge
  spa-pool.jpg          Gallery (large tile): pool with palm trees
  spa-gallery-1.jpg     Gallery: towels, oils and stones
  spa-gallery-2.jpg     Gallery: warmly lit treatment room
  spa-gallery-3.jpg     Gallery: spa room with stone bath
  spa-gallery-4.jpg     Gallery: sun loungers at sunset
  spa-gallery-5.jpg     Gallery: essential oils and lavender

  favicon.svg / .ico    Browser-tab logo (leaf in a gold ring), plus favicon-32.png,
  favicon-192.png       favicon-192.png and apple-touch-icon.png for phones.
                        They are linked in the <head> of index.html. If the tab
                        still shows the old icon, hard refresh (Ctrl+Shift+R).

Quality note: several of the supplied pictures were small (about 250-600px
wide), so the hero, the gallery tiles and the lightbox view can look soft on
large or high-density screens. For the best result, replace them with larger
photos (hero 2000px+ wide, others 1200px+ wide) using the SAME filenames, and
nothing else needs to change. Free sources (check each licence):
  https://unsplash.com/s/photos/spa
  https://www.pexels.com/search/spa/

Photos with visible logos or watermarks (a salon interior, a spa reception
and a "for your home" aromatherapy banner) were not used.


3. THINGS YOU CAN EDIT
----------------------
- Contact details: phone, email and address appear in components/header.html
  (top bar and mobile menu), components/footer.html and the contact and
  enquiry sections of index.html. Search for 8830532500 / 88305 32500,
  shelarjayshree635@gmail.com and "Pimpri Chinchwad" to change them.
- Enquiry form: it opens WhatsApp with the message ready for the number set
  at the top of js/booking.js (WHATSAPP_NUMBER, digits only with country code,
  currently 918830532500). A static site cannot send messages silently, so the
  visitor taps Send in WhatsApp to deliver the enquiry.
- Map: the Google Maps embed in the contact section searches for
  "Pimpri Chinchwad, Maharashtra". For an exact pin, open your place in Google
  Maps, choose Share > Embed a map, and paste the new iframe src.
- Banners: three slides in the hero section of index.html. They change every
  6 seconds (INTERVAL in js/main.js and --hero-interval in css/style.css).
- Opening hours, prices and testimonials are sample content. Social links
  point to each platform's home page; replace them with your profiles.


4. FILE MAP
-----------
index.html              Single-page site (all sections, form, lightbox)
components/header.html  Header and navigation (loaded by js/components.js)
components/footer.html  Footer (loaded by js/components.js)
js/components.js        Loads header and footer, then initialises them
js/main.js              Mobile nav, smooth scroll, active link, reveal,
                        lightbox, copyright year
js/booking.js           Form validation, treatment preselection, messages
css/style.css           Brand styles, animations, lightbox
