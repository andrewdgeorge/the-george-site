/* analytics.js — GA4 + Microsoft Clarity wiring
 *
 * Setup:
 * 1. Replace GA_MEASUREMENT_ID with the GA4 Measurement ID, e.g. G-ABC123XYZ.
 * 2. Replace CLARITY_PROJECT_ID with the Microsoft Clarity project ID.
 *
 * Until those IDs are set, this file records nothing and has no visitor impact.
 */
(function () {
  'use strict';

  var GA_MEASUREMENT_ID = 'G-YVK6198ECD';
  var CLARITY_PROJECT_ID = 'wskjjsbenl';
  var hasGA = /^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID) && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
  var hasClarity = /^[a-z0-9]+$/i.test(CLARITY_PROJECT_ID) && CLARITY_PROJECT_ID !== 'XXXXXXXXXX';

  function loadScript(src, attrs) {
    var script = document.createElement('script');
    script.async = true;
    script.src = src;
    if (attrs) Object.keys(attrs).forEach(function (key) { script.setAttribute(key, attrs[key]); });
    document.head.appendChild(script);
  }

  if (hasGA) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
      anonymize_ip: true
    });
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID));
  }

  if (hasClarity) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r);
      t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);
  }

  function clean(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  function track(name, params) {
    var eventName = clean(name);
    if (!eventName) return;
    var payload = Object.assign({
      page_path: location.pathname,
      page_title: document.title
    }, params || {});
    if (window.gtag) window.gtag('event', eventName, payload);
    if (window.clarity) window.clarity('event', eventName);
  }

  window.gTrack = track;

  document.addEventListener('click', function (event) {
    var el = event.target.closest('a, button, [role="button"], .calc-day-btn, .addon-pill, .bc-hour-btn, .avail-day');
    if (!el) return;

    if (el.matches('.nav-cta')) {
      track('click_inquire_nav', { label: el.textContent, href: el.getAttribute('href') || '' });
    } else if (el.matches('.hero-cta-link')) {
      track('click_hero_inquire', { label: el.textContent });
    } else if (el.matches('.btn-select-date')) {
      track('click_select_date', { label: el.textContent });
    } else if (el.matches('.avail-next-btn')) {
      track('click_check_availability', { label: el.textContent });
    } else if (el.matches('.spb-cta')) {
      track('click_sticky_check_date', { label: el.textContent });
    } else if (el.matches('.calc-day-btn')) {
      track('calculator_day_selected', { day: el.dataset.label || el.textContent });
    } else if (el.matches('.addon-pill')) {
      track('calculator_addon_toggle', { label: el.textContent });
    } else if (el.matches('.bc-hour-btn')) {
      track('calculator_duration_selected', { label: el.textContent });
    } else if (el.matches('.avail-day') && !el.disabled && el.dataset.date) {
      track('date_selected', { event_date: el.dataset.date });
    }
  }, true);

  document.addEventListener('change', function (event) {
    if (event.target && event.target.matches('#bcGuests')) {
      track('calculator_guest_change', { guests: event.target.value });
    }
  }, true);

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || !form.matches('form.inquiry-form')) return;
    track('form_submit_attempt', { form_name: form.getAttribute('name') || '' });
  }, true);

  document.addEventListener('george:form-submit-success', function (event) {
    track('form_submit_success', {
      form_name: (event.detail && event.detail.formName) || ''
    });
  });
}());
