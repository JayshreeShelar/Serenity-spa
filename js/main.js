/**
 * Serenity Spa: main interactions
 * Mobile navigation, smooth scrolling, active nav state, scroll reveal,
 * gallery lightbox, dynamic copyright year and image fallback handling.
 *
 * Header/footer behaviour is exposed as SerenitySpa.initHeader() and
 * SerenitySpa.initFooter(); js/components.js calls them after loading.
 */
(function () {
  'use strict';

  document.documentElement.classList.add('js-enabled');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var headerReady = false;

  /* ------------------------------------------------------------------
     Helpers
  ------------------------------------------------------------------ */
  function scrollToTarget(target) {
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function getMobileMenuParts() {
    return {
      header: document.getElementById('site-header'),
      toggle: document.getElementById('mobile-menu-toggle'),
      menu: document.getElementById('mobile-menu')
    };
  }

  function setMobileMenu(open) {
    var parts = getMobileMenuParts();
    if (!parts.header || !parts.toggle || !parts.menu) {
      return;
    }

    parts.menu.classList.toggle('hidden', !open);
    parts.header.classList.toggle('menu-open', open);
    parts.toggle.setAttribute('aria-expanded', String(open));
    parts.toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');

    var openIcon = parts.toggle.querySelector('[data-icon-open]');
    var closeIcon = parts.toggle.querySelector('[data-icon-close]');
    if (openIcon) { openIcon.classList.toggle('hidden', open); }
    if (closeIcon) { closeIcon.classList.toggle('hidden', !open); }
  }

  function isMobileMenuOpen() {
    var menu = document.getElementById('mobile-menu');
    return Boolean(menu) && !menu.classList.contains('hidden');
  }

  function setCurrentYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll('[data-current-year]').forEach(function (el) {
      el.textContent = year;
    });
  }

  /* ------------------------------------------------------------------
     Smooth scrolling (delegated, so it also covers header/footer links)
  ------------------------------------------------------------------ */
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');

    // Links with data-book-select are handled in js/booking.js
    if (!link || link.hasAttribute('data-book-select')) {
      return;
    }

    var hash = link.getAttribute('href');
    if (!hash || hash.length < 2) {
      return;
    }

    var target = document.getElementById(hash.slice(1));
    if (!target) {
      return;
    }

    event.preventDefault();
    setMobileMenu(false);
    scrollToTarget(target);

    if (window.history && typeof window.history.replaceState === 'function') {
      window.history.replaceState(null, '', hash);
    }
  });

  /* ------------------------------------------------------------------
     Header: mobile menu, sticky state, active section
  ------------------------------------------------------------------ */
  function initHeader() {
    if (headerReady) {
      return;
    }

    var parts = getMobileMenuParts();
    if (!parts.header) {
      console.error('[Serenity Spa] Header markup not found after loading components/header.html.');
      return;
    }
    headerReady = true;

    // Mobile menu toggle
    if (parts.toggle) {
      parts.toggle.addEventListener('click', function () {
        setMobileMenu(!isMobileMenuOpen());
      });
    }

    // Close on Escape, outside click, and when resizing to desktop
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isMobileMenuOpen()) {
        setMobileMenu(false);
        if (parts.toggle) { parts.toggle.focus(); }
      }
    });

    document.addEventListener('click', function (event) {
      if (isMobileMenuOpen() && !parts.header.contains(event.target)) {
        setMobileMenu(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024 && isMobileMenuOpen()) {
        setMobileMenu(false);
      }
    });

    // Sticky header state + active link, throttled with requestAnimationFrame
    var ticking = false;

    function update() {
      ticking = false;
      parts.header.classList.toggle('is-scrolled', window.scrollY > 24);
      updateActiveLink(parts.header);
    }

    function requestUpdate() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    update();
  }

  function updateActiveLink(header) {
    var sections = Array.prototype.slice.call(document.querySelectorAll('main > section[id]'));
    var marker = header.offsetHeight + window.innerHeight * 0.25;
    var currentId = '';

    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= marker) {
        currentId = section.id;
      }
    });

    // Reaching the page bottom should highlight the last nav section
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) {
      currentId = 'contact';
    }

    header.querySelectorAll('[data-nav-link]').forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + currentId;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ------------------------------------------------------------------
     Footer
  ------------------------------------------------------------------ */
  function initFooter() {
    setCurrentYear();
  }

  /* ------------------------------------------------------------------
     Scroll reveal
  ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) { item.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.classList.add('is-visible');
          observer.unobserve(el);

          // Once the entrance has finished, drop the reveal classes so the
          // element's own hover transforms and transitions (cards, etc.) take over.
          window.setTimeout(function () {
            el.classList.remove('reveal', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'is-visible');
          }, 1600);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (item) { observer.observe(item); });
  }

  /* ------------------------------------------------------------------
     Gallery lightbox
  ------------------------------------------------------------------ */
  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    var image = document.getElementById('lightbox-image');
    var caption = document.getElementById('lightbox-caption');
    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));

    if (!lightbox || !image || !triggers.length) {
      return;
    }

    var closeBtn = lightbox.querySelector('[data-lightbox-close]');
    var prevBtn = lightbox.querySelector('[data-lightbox-prev]');
    var nextBtn = lightbox.querySelector('[data-lightbox-next]');
    var currentIndex = 0;
    var lastFocused = null;

    image.addEventListener('load', function () {
      image.classList.remove('img-missing');
    });

    function show(index) {
      var count = triggers.length;
      currentIndex = (index + count) % count;

      var thumb = triggers[currentIndex].querySelector('img');
      if (!thumb) {
        return;
      }

      image.classList.remove('img-missing');
      image.src = thumb.getAttribute('src');
      image.alt = thumb.getAttribute('alt') || '';
      caption.textContent = thumb.getAttribute('alt') || '';
    }

    function open(index) {
      lastFocused = document.activeElement;
      show(index);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      closeBtn.focus();
    }

    function close() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      image.removeAttribute('src');
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    function isOpen() {
      return lightbox.classList.contains('is-open');
    }

    triggers.forEach(function (trigger, index) {
      trigger.addEventListener('click', function () { open(index); });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(currentIndex - 1); });
    nextBtn.addEventListener('click', function () { show(currentIndex + 1); });

    // Clicking the dark backdrop closes the viewer
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) {
        close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (!isOpen()) {
        return;
      }

      if (event.key === 'Escape') {
        close();
      } else if (event.key === 'ArrowLeft') {
        show(currentIndex - 1);
      } else if (event.key === 'ArrowRight') {
        show(currentIndex + 1);
      } else if (event.key === 'Tab') {
        // Keep keyboard focus inside the dialog
        var focusable = [closeBtn, prevBtn, nextBtn];
        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     Missing image fallback
     If a photo has not been added yet, hide the broken-image icon so the
     soft gradient frame shows instead of a broken layout.
  ------------------------------------------------------------------ */
  function markMissing(img) {
    img.classList.add('img-missing');
  }

  document.addEventListener('error', function (event) {
    if (event.target instanceof HTMLImageElement) {
      markMissing(event.target);
    }
  }, true);

  window.addEventListener('load', function () {
    document.querySelectorAll('img').forEach(function (img) {
      if (img.getAttribute('src') && img.complete && img.naturalWidth === 0) {
        markMissing(img);
      }
    });
  });

  /* ------------------------------------------------------------------
     Hero banner slider (3 banners, auto-changing)
  ------------------------------------------------------------------ */
  function initHeroSlider() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prevBtn = hero.querySelector('[data-hero-prev]');
    var nextBtn = hero.querySelector('[data-hero-next]');
    var INTERVAL = 6000; // keep in sync with --hero-interval in css/style.css
    var index = 0;
    var timer = null;
    var startedAt = 0;
    var remaining = INTERVAL;
    var paused = false;

    if (slides.length < 2) {
      return;
    }

    function clearTimer() {
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
    }

    function schedule(ms) {
      clearTimer();
      if (reducedMotion) {
        return;
      }
      startedAt = Date.now();
      timer = window.setTimeout(function () { show(index + 1); }, ms);
    }

    function show(next) {
      index = (next + slides.length) % slides.length;
      remaining = INTERVAL;

      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });

      dots.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle('is-active', active);
        if (active) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });

      if (!paused) {
        schedule(remaining);
      }
    }

    function pause() {
      if (paused || reducedMotion) {
        return;
      }
      paused = true;
      hero.classList.add('is-paused');
      remaining = Math.max(remaining - (Date.now() - startedAt), 300);
      clearTimer();
    }

    function resume() {
      if (!paused) {
        return;
      }
      paused = false;
      hero.classList.remove('is-paused');
      schedule(remaining);
    }

    if (prevBtn) { prevBtn.addEventListener('click', function () { show(index - 1); }); }
    if (nextBtn) { nextBtn.addEventListener('click', function () { show(index + 1); }); }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); });
    });

    // Pause while the visitor hovers or focuses inside the banner
    hero.addEventListener('mouseenter', pause);
    hero.addEventListener('mouseleave', resume);
    hero.addEventListener('focusin', pause);
    hero.addEventListener('focusout', resume);

    // Pause while the tab is in the background
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { pause(); } else { resume(); }
    });

    // Swipe on touch screens
    var touchX = null;
    hero.addEventListener('touchstart', function (event) {
      touchX = event.changedTouches[0].clientX;
    }, { passive: true });
    hero.addEventListener('touchend', function (event) {
      if (touchX === null) { return; }
      var dx = event.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 50) {
        show(dx < 0 ? index + 1 : index - 1);
      }
    }, { passive: true });

    if (reducedMotion) {
      hero.classList.add('is-static');
    }

    slides.forEach(function (slide, i) {
      slide.setAttribute('aria-hidden', String(i !== 0));
    });
    schedule(INTERVAL);
  }

  /* ------------------------------------------------------------------
     Boot
  ------------------------------------------------------------------ */
  initHeroSlider();
  initReveal();
  initLightbox();

  window.SerenitySpa = {
    initHeader: initHeader,
    initFooter: initFooter,
    scrollToTarget: scrollToTarget
  };
})();
