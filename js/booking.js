/**
 * Serenity Spa: enquiry form
 * Validation, past-date prevention, treatment preselection, and sending the
 * enquiry to the spa's WhatsApp number.
 *
 * This is a static website with no backend, so the enquiry cannot be
 * delivered silently. On submit it opens WhatsApp (app or web) with the
 * message already written for the spa's number; the visitor then taps Send.
 */
(function () {
  'use strict';

  // Number that receives enquiries: country code + number, digits only.
  var WHATSAPP_NUMBER = '918830532500';

  var form = document.getElementById('booking-form');
  if (!form) {
    return;
  }

  var successPanel = document.getElementById('booking-success');
  var successMessage = document.getElementById('booking-success-message');
  var whatsappLink = document.getElementById('booking-whatsapp-link');
  var resetButton = document.getElementById('booking-reset');
  var statusBox = document.getElementById('booking-status');
  var selectionNote = document.getElementById('booking-selection-note');
  var bookingSection = document.getElementById('booking');

  var fields = {
    name: document.getElementById('booking-name'),
    email: document.getElementById('booking-email'),
    phone: document.getElementById('booking-phone'),
    treatment: document.getElementById('booking-treatment'),
    date: document.getElementById('booking-date'),
    time: document.getElementById('booking-time')
  };
  var messageField = document.getElementById('booking-message');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_PATTERN = /^\+?[0-9\s\-()]+$/;
  var NAME_PATTERN = /^[\p{L}][\p{L}\s.'\-]*$/u;

  /* ------------------------------------------------------------------
     Dates
  ------------------------------------------------------------------ */
  function pad(number) {
    return String(number).padStart(2, '0');
  }

  function todayISO() {
    var now = new Date();
    return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  }

  function formatReadableDate(iso) {
    var parts = iso.split('-').map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function setMinimumDate() {
    fields.date.setAttribute('min', todayISO());
  }

  // When today is selected, disable time slots that have already passed
  function updateTimeSlots() {
    var isToday = fields.date.value === todayISO();
    var now = new Date();
    var nowMinutes = now.getHours() * 60 + now.getMinutes();

    Array.prototype.forEach.call(fields.time.options, function (option) {
      if (!option.value) {
        return;
      }
      var hours = Number(option.value.split(':')[0]);
      option.disabled = isToday && hours * 60 <= nowMinutes;
    });

    var selected = fields.time.options[fields.time.selectedIndex];
    if (selected && selected.disabled) {
      fields.time.value = '';
    }
  }

  /* ------------------------------------------------------------------
     Validation
  ------------------------------------------------------------------ */
  var validators = {
    name: function (value) {
      var v = value.trim();
      if (!v) { return 'Please enter your full name.'; }
      if (v.length < 2) { return 'Your name must be at least 2 characters.'; }
      if (!NAME_PATTERN.test(v)) { return 'Please use letters only in your name.'; }
      return '';
    },
    email: function (value) {
      var v = value.trim();
      if (!v) { return 'Please enter your email address.'; }
      if (!EMAIL_PATTERN.test(v)) { return 'Please enter a valid email address, such as name@example.com.'; }
      return '';
    },
    phone: function (value) {
      var v = value.trim();
      if (!v) { return 'Please enter your phone number.'; }
      var digits = v.replace(/\D/g, '');
      if (!PHONE_PATTERN.test(v) || digits.length < 10 || digits.length > 13) {
        return 'Please enter a valid phone number with 10 to 13 digits.';
      }
      return '';
    },
    treatment: function (value) {
      return value ? '' : 'Please choose a treatment or package.';
    },
    date: function (value) {
      if (!value) { return 'Please choose a preferred date.'; }
      if (value < todayISO()) { return 'Please choose today or a future date.'; }
      return '';
    },
    time: function (value) {
      return value ? '' : 'Please choose a preferred time.';
    }
  };

  function getErrorElement(key) {
    return document.getElementById('booking-' + key + '-error');
  }

  function showError(key, message) {
    var field = fields[key];
    var errorEl = getErrorElement(key);
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function clearError(key) {
    var field = fields[key];
    var errorEl = getErrorElement(key);
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
    errorEl.textContent = '';
    errorEl.hidden = true;
  }

  function validateField(key) {
    var message = validators[key](fields[key].value);
    if (message) {
      showError(key, message);
      return false;
    }
    clearError(key);
    return true;
  }

  function validateAll() {
    var firstInvalid = null;

    Object.keys(fields).forEach(function (key) {
      var valid = validateField(key);
      if (!valid && !firstInvalid) {
        firstInvalid = fields[key];
      }
    });

    return firstInvalid;
  }

  function showStatus(message) {
    statusBox.textContent = message;
    statusBox.hidden = false;
  }

  function hideStatus() {
    statusBox.textContent = '';
    statusBox.hidden = true;
  }

  /* ------------------------------------------------------------------
     Treatment preselection and enquiry buttons
  ------------------------------------------------------------------ */
  function showForm() {
    form.hidden = false;
    successPanel.hidden = true;
  }

  function preselect(value) {
    var option = Array.prototype.find.call(fields.treatment.options, function (opt) {
      return opt.value === value;
    });

    if (!option) {
      console.warn('[Serenity Spa] No enquiry option found for "' + value + '".');
      return false;
    }

    // Show the form again if a previous submission replaced it
    showForm();
    fields.treatment.value = value;
    clearError('treatment');
    hideStatus();

    selectionNote.textContent = 'Selected: ' + option.textContent;
    selectionNote.hidden = false;
    return true;
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-book-select]');
    if (!trigger) {
      return;
    }

    event.preventDefault();
    preselect(trigger.getAttribute('data-book-select'));

    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(function () {
        fields.name.focus({ preventScroll: true });
      }, reducedMotion ? 0 : 700);
    }

    // Close the mobile menu if the click came from the menu
    var menu = document.getElementById('mobile-menu');
    var toggle = document.getElementById('mobile-menu-toggle');
    if (menu && toggle && !menu.classList.contains('hidden')) {
      toggle.click();
    }
  });

  /* ------------------------------------------------------------------
     Submit: build the WhatsApp message and open it
  ------------------------------------------------------------------ */
  function buildMessage(values) {
    var lines = [
      'Hello Serenity Spa, I would like to enquire about ' + values.treatment + '.',
      '',
      'Name: ' + values.name,
      'Phone: ' + values.phone,
      'Email: ' + values.email,
      'Preferred date: ' + values.date,
      'Preferred time: ' + values.time
    ];

    if (values.message) {
      lines.push('', 'Message: ' + values.message);
    }

    return lines.join('\n');
  }

  function showSuccess(firstName, treatment, url) {
    successMessage.textContent =
      'Thank you, ' + firstName + '. WhatsApp should now open with your enquiry for ' + treatment +
      ' ready to send to Serenity Spa. Please tap Send there to deliver it. ' +
      'If nothing opened, use the Open WhatsApp button below.';

    whatsappLink.setAttribute('href', url);
    form.hidden = true;
    successPanel.hidden = false;
    successPanel.focus({ preventScroll: true });
    successPanel.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideStatus();

    var firstInvalid = validateAll();
    if (firstInvalid) {
      showStatus('Please review the highlighted fields and try again.');
      firstInvalid.focus();
      return;
    }

    var treatmentOption = fields.treatment.options[fields.treatment.selectedIndex];
    var timeOption = fields.time.options[fields.time.selectedIndex];
    var values = {
      name: fields.name.value.trim(),
      phone: fields.phone.value.trim(),
      email: fields.email.value.trim(),
      treatment: treatmentOption.textContent,
      date: formatReadableDate(fields.date.value),
      time: timeOption.textContent,
      message: messageField.value.trim()
    };

    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(buildMessage(values));
    var firstName = values.name.split(/\s+/)[0];

    window.open(url, '_blank', 'noopener');

    form.reset();
    selectionNote.hidden = true;
    updateTimeSlots();
    showSuccess(firstName, values.treatment, url);
  });

  resetButton.addEventListener('click', function () {
    showForm();
    fields.name.focus();
  });

  // Validate on blur; re-validate on input once a field has an error
  Object.keys(fields).forEach(function (key) {
    var field = fields[key];
    var eventName = field.tagName === 'SELECT' || field.type === 'date' ? 'change' : 'input';

    field.addEventListener('blur', function () {
      if (field.value || field.classList.contains('is-invalid')) {
        validateField(key);
      }
    });

    field.addEventListener(eventName, function () {
      if (field.classList.contains('is-invalid')) {
        validateField(key);
      }
    });
  });

  fields.date.addEventListener('change', updateTimeSlots);

  // Keep the "Selected" note in step with manual changes to the dropdown
  fields.treatment.addEventListener('change', function () {
    var option = fields.treatment.options[fields.treatment.selectedIndex];
    if (fields.treatment.value) {
      selectionNote.textContent = 'Selected: ' + option.textContent;
      selectionNote.hidden = false;
    } else {
      selectionNote.hidden = true;
    }
  });

  /* ------------------------------------------------------------------
     Init
  ------------------------------------------------------------------ */
  setMinimumDate();
  updateTimeSlots();
})();
