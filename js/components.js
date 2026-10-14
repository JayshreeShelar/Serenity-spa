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
