/**
 * Serenity Spa: component loader
 * Loads components/header.html and components/footer.html into their
 * placeholders, then initialises the interactions that depend on them.
 *
 * Note: fetch() does not work over file://. Run the site with VS Code
 * Live Server (or any local web server).
 */
(function () {
  'use strict';

  var COMPONENTS = [
    { placeholderId: 'header-placeholder', url: 'components/header.html', onLoad: 'initHeader' },
    { placeholderId: 'footer-placeholder', url: 'components/footer.html', onLoad: 'initFooter' }
  ];

  // Full copies of components/header.html and components/footer.html. Used only when the files cannot be
  // fetched (e.g. index.html opened by double-click instead of a local server). Keep them in sync if you edit the components.
  var EMBEDDED = {
    'components/header.html': "<header id=\"site-header\" class=\"site-header fixed inset-x-0 top-0 z-50\">\n\n  <!-- Contact bar (desktop only; collapses once the page is scrolled) -->\n  <div class=\"topbar hidden lg:block\">\n    <div class=\"wrap flex h-9 items-center justify-between text-xs\">\n      <ul class=\"flex items-center gap-6\">\n        <li>\n          <a href=\"tel:+918830532500\" class=\"topbar-link\">\n            <i class=\"fa-solid fa-phone\" aria-hidden=\"true\"></i>+91 88305 32500\n          </a>\n        </li>\n        <li>\n          <a href=\"mailto:shelarjayshree635@gmail.com\" class=\"topbar-link\">\n            <i class=\"fa-solid fa-envelope\" aria-hidden=\"true\"></i>shelarjayshree635@gmail.com\n          </a>\n        </li>\n        <li class=\"topbar-link\">\n          <i class=\"fa-solid fa-location-dot\" aria-hidden=\"true\"></i>Pimpri Chinchwad, Maharashtra\n        </li>\n      </ul>\n      <div class=\"flex items-center gap-4\">\n        <a href=\"https://www.instagram.com/\" class=\"topbar-link\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Instagram\">\n          <i class=\"fa-brands fa-instagram\" aria-hidden=\"true\"></i>\n        </a>\n        <a href=\"https://www.facebook.com/\" class=\"topbar-link\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Facebook\">\n          <i class=\"fa-brands fa-facebook-f\" aria-hidden=\"true\"></i>\n        </a>\n        <a href=\"https://wa.me/918830532500\" class=\"topbar-link\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"WhatsApp\">\n          <i class=\"fa-brands fa-whatsapp\" aria-hidden=\"true\"></i>\n        </a>\n      </div>\n    </div>\n  </div>\n\n  <!-- Main bar -->\n  <div class=\"header-main\">\n    <div class=\"wrap header-bar flex items-center justify-between\">\n      <a href=\"#home\" class=\"wordmark\" aria-label=\"Serenity Spa, back to top\">\n        <span class=\"logo-mark\"><i class=\"fa-solid fa-leaf\" aria-hidden=\"true\"></i></span>\n        <span class=\"flex flex-col leading-none\">\n          <span class=\"font-display text-[1.7rem] font-semibold tracking-wide\">Serenity</span>\n          <span class=\"mt-1 text-[0.58rem] font-bold uppercase tracking-[0.42em]\">Wellness &amp; Spa</span>\n        </span>\n      </a>\n\n      <nav class=\"hidden lg:block\" aria-label=\"Primary\">\n        <ul class=\"flex items-center gap-7\">\n          <li><a href=\"#home\" class=\"nav-link\" data-nav-link>Home</a></li>\n          <li><a href=\"#about\" class=\"nav-link\" data-nav-link>About</a></li>\n          <li><a href=\"#treatments\" class=\"nav-link\" data-nav-link>Treatments</a></li>\n          <li><a href=\"#experience\" class=\"nav-link\" data-nav-link>Experience</a></li>\n          <li><a href=\"#packages\" class=\"nav-link\" data-nav-link>Packages</a></li>\n          <li><a href=\"#gallery\" class=\"nav-link\" data-nav-link>Gallery</a></li>\n          <li><a href=\"#contact\" class=\"nav-link\" data-nav-link>Contact</a></li>\n        </ul>\n      </nav>\n\n      <a href=\"#booking\" class=\"btn btn-gold btn-sm hidden lg:inline-flex\">\n        Enquire Now <i class=\"fa-solid fa-arrow-right btn-arrow\" aria-hidden=\"true\"></i>\n      </a>\n\n      <button\n        id=\"mobile-menu-toggle\"\n        type=\"button\"\n        class=\"menu-toggle lg:hidden\"\n        aria-expanded=\"false\"\n        aria-controls=\"mobile-menu\"\n        aria-label=\"Open navigation menu\"\n      >\n        <i class=\"fa-solid fa-bars\" data-icon-open aria-hidden=\"true\"></i>\n        <i class=\"fa-solid fa-xmark hidden\" data-icon-close aria-hidden=\"true\"></i>\n      </button>\n    </div>\n  </div>\n\n  <!-- Mobile menu -->\n  <div id=\"mobile-menu\" class=\"mobile-menu hidden lg:hidden\">\n    <nav class=\"wrap py-3\" aria-label=\"Mobile\">\n      <ul>\n        <li><a href=\"#home\" class=\"nav-link\" data-nav-link>Home</a></li>\n        <li><a href=\"#about\" class=\"nav-link\" data-nav-link>About</a></li>\n        <li><a href=\"#treatments\" class=\"nav-link\" data-nav-link>Treatments</a></li>\n        <li><a href=\"#experience\" class=\"nav-link\" data-nav-link>Experience</a></li>\n        <li><a href=\"#packages\" class=\"nav-link\" data-nav-link>Packages</a></li>\n        <li><a href=\"#gallery\" class=\"nav-link\" data-nav-link>Gallery</a></li>\n        <li><a href=\"#contact\" class=\"nav-link\" data-nav-link>Contact</a></li>\n      </ul>\n      <a href=\"#booking\" class=\"btn btn-olive btn-block mt-4\">Enquire Now</a>\n      <div class=\"mt-4 grid grid-cols-2 gap-3\">\n        <a href=\"tel:+918830532500\" class=\"btn btn-outline-olive btn-sm\"><i class=\"fa-solid fa-phone\" aria-hidden=\"true\"></i>Call</a>\n        <a href=\"https://wa.me/918830532500\" class=\"btn btn-outline-olive btn-sm\" target=\"_blank\" rel=\"noopener noreferrer\"><i class=\"fa-brands fa-whatsapp\" aria-hidden=\"true\"></i>WhatsApp</a>\n      </div>\n    </nav>\n  </div>\n</header>",
    'components/footer.html': "<footer class=\"site-footer\" aria-label=\"Site footer\">\n  <div class=\"wrap py-8 md:py-10\">\n    <div class=\"grid grid-cols-2 gap-x-5 gap-y-8 sm:gap-8 lg:grid-cols-4\">\n      <div class=\"col-span-2 sm:col-span-1\">\n        <a href=\"#home\" class=\"wordmark text-white\" aria-label=\"Serenity Spa, back to top\">\n          <span class=\"logo-mark\"><i class=\"fa-solid fa-leaf\" aria-hidden=\"true\"></i></span>\n          <span class=\"flex flex-col leading-none\">\n            <span class=\"font-display text-[1.7rem] font-semibold tracking-wide\">Serenity</span>\n            <span class=\"mt-1 text-[0.58rem] font-bold uppercase tracking-[0.42em]\">Wellness &amp; Spa</span>\n          </span>\n        </a>\n        <p class=\"mt-4 max-w-xs text-sm\">\n          A calm space to pause, breathe and restore. Find Your Moment of Serenity.\n        </p>\n        <div class=\"mt-4 flex gap-3\">\n          <a href=\"https://www.instagram.com/\" class=\"social-link\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Instagram\">\n            <i class=\"fa-brands fa-instagram\" aria-hidden=\"true\"></i>\n          </a>\n          <a href=\"https://www.facebook.com/\" class=\"social-link\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Facebook\">\n            <i class=\"fa-brands fa-facebook-f\" aria-hidden=\"true\"></i>\n          </a>\n          <a href=\"https://wa.me/918830532500\" class=\"social-link\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"WhatsApp\">\n            <i class=\"fa-brands fa-whatsapp\" aria-hidden=\"true\"></i>\n          </a>\n        </div>\n      </div>\n\n      <nav aria-label=\"Quick links\" class=\"lg:mx-auto lg:w-fit\">\n        <h2 class=\"footer-heading\">Quick Links</h2>\n        <ul class=\"space-y-1.5 text-sm\">\n          <li><a href=\"#home\">Home</a></li>\n          <li><a href=\"#about\">About</a></li>\n          <li><a href=\"#treatments\">Treatments</a></li>\n          <li><a href=\"#experience\">Experience</a></li>\n          <li><a href=\"#packages\">Packages</a></li>\n          <li><a href=\"#gallery\">Gallery</a></li>\n          <li><a href=\"#contact\">Contact</a></li>\n        </ul>\n      </nav>\n\n      <nav aria-label=\"Treatments\">\n        <h2 class=\"footer-heading\">Treatments</h2>\n        <ul class=\"space-y-1.5 text-sm\">\n          <li><a href=\"#booking\" data-book-select=\"relaxation-massage\">Relaxation Massage</a></li>\n          <li><a href=\"#booking\" data-book-select=\"signature-facial\">Signature Facial</a></li>\n          <li><a href=\"#booking\" data-book-select=\"aromatherapy\">Aromatherapy</a></li>\n          <li><a href=\"#booking\" data-book-select=\"body-renewal\">Body Renewal Treatment</a></li>\n        </ul>\n      </nav>\n\n      <div class=\"col-span-2 text-center sm:col-span-1 sm:text-left\">\n        <h2 class=\"footer-heading\">Contact</h2>\n        <ul class=\"space-y-2.5 text-sm\">\n          <li class=\"flex justify-center gap-3 sm:justify-start\">\n            <i class=\"fa-solid fa-location-dot mt-1 text-gold\" aria-hidden=\"true\"></i>\n            <a href=\"https://www.google.com/maps/search/?api=1&amp;query=Pimpri+Chinchwad%2C+Maharashtra\" target=\"_blank\" rel=\"noopener noreferrer\">Pimpri Chinchwad, Maharashtra</a>\n          </li>\n          <li class=\"flex justify-center gap-3 sm:justify-start\">\n            <i class=\"fa-solid fa-phone mt-1 text-gold\" aria-hidden=\"true\"></i>\n            <a href=\"tel:+918830532500\">+91 88305 32500</a>\n          </li>\n          <li class=\"flex justify-center gap-3 sm:justify-start\">\n            <i class=\"fa-solid fa-envelope mt-1 text-gold\" aria-hidden=\"true\"></i>\n            <a href=\"mailto:shelarjayshree635@gmail.com\" class=\"break-all\">shelarjayshree635@gmail.com</a>\n          </li>\n        </ul>\n      </div>\n    </div>\n\n    <div class=\"mt-8 border-t border-white/15 pt-5 text-xs\">\n      <p>&copy; <span data-current-year>2026</span> Serenity Spa. All rights reserved.</p>\n    </div>\n  </div>\n</footer>"
  };

  async function loadComponent(component) {
    var host = document.getElementById(component.placeholderId);

    if (!host) {
      console.error('[Serenity Spa] Missing placeholder #' + component.placeholderId + ' in index.html.');
      return false;
    }

    try {
      var response = await fetch(component.url);
      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ' ' + response.statusText);
      }
      host.innerHTML = await response.text();
      return true;
    } catch (error) {
      console.error(
        '[Serenity Spa] Could not load "' + component.url + '": ' + error.message + '. ' +
        'If you opened index.html directly (file://), run the site through VS Code Live Server ' +
        'or another local web server so fetch() can read the component files.'
      );
      if (EMBEDDED[component.url]) {
        host.innerHTML = EMBEDDED[component.url];
        return true;
      }
      return false;
    }
  }

  async function init() {
    var results = await Promise.all(COMPONENTS.map(loadComponent));

    results.forEach(function (loaded, index) {
      var initName = COMPONENTS[index].onLoad;
      var app = window.SerenitySpa;

      if (!loaded) {
        return;
      }

      if (app && typeof app[initName] === 'function') {
        app[initName]();
      } else {
        console.error('[Serenity Spa] js/main.js did not expose SerenitySpa.' + initName + '().');
      }
    });
  }

  init();
})();
