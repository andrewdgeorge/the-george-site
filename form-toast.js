(function () {
  // Inject toast HTML
  var toast = document.createElement('div');
  toast.className = 'lp-toast';
  toast.id = 'lpToast';
  toast.innerHTML = [
    '<div class="lp-toast-rule"></div>',
    '<div class="lp-toast-body">',
      '<div class="lp-toast-label">Inquiry Received</div>',
      '<div class="lp-toast-title">Thank you — we\'ll be in touch soon.</div>',
      '<div class="lp-toast-sub">We respond within one business day to arrange a private tour.</div>',
    '</div>',
    '<button class="lp-toast-close" onclick="lpDismissToast()" aria-label="Close">&times;</button>'
  ].join('');
  document.body.appendChild(toast);

  var _timer = null;

  window.lpShowToast = function (title, sub) {
    var titleEl = toast.querySelector('.lp-toast-title');
    var subEl = toast.querySelector('.lp-toast-sub');
    if (titleEl) titleEl.textContent = title || 'Thank you - we will be in touch soon.';
    if (subEl) subEl.textContent = sub || 'We respond within one business day to arrange a private tour.';
    toast.classList.add('lp-toast--show');
    clearTimeout(_timer);
    _timer = setTimeout(window.lpDismissToast, 6000);
  };

  window.lpDismissToast = function () {
    toast.classList.remove('lp-toast--show');
    clearTimeout(_timer);
  };

  function val(form, name) {
    return ((form.querySelector('[name="' + name + '"]') || {}).value || '');
  }

  // Wire up AJAX submit on the inquiry form
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('form.inquiry-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Sync hidden calculator fields before reading values
      if (window.gBar) gBar.calc();

      var btn = form.querySelector('[type="submit"]');
      btn.textContent = 'Sending…';
      btn.disabled = true;

      // Build payload for send-thanks email
      var payload = {
        firstName: val(form, 'first-name'),
        email:     val(form, 'email'),
        eventDate: val(form, 'event-date'),
        eventType: val(form, 'event-type'),
        venue:     val(form, 'calc-venue'),
        guests:    val(form, 'calc-guests'),
        courtyard: val(form, 'calc-courtyard'),
        bar:       val(form, 'calc-bar'),
        florals:   val(form, 'calc-florals'),
        total:     val(form, 'calc-total')
      };
      payload.formName = val(form, 'form-name');
      payload.botField = val(form, 'bot-field');

      // Append calculator summary to message field
      var msgEl = form.querySelector('[name="message"]');
      if (msgEl) {
        var lines = [
          '── Calculator Estimate ──',
          'Venue: '     + (payload.venue     || '—'),
          'Guests: '    + (payload.guests    || '—'),
          'Courtyard: ' + (payload.courtyard || '—'),
          'Bar: '       + (payload.bar       || '—'),
          'Florals: '   + (payload.florals   || '—'),
          'Total: '     + (payload.total     || '—')
        ];
        var existing = msgEl.value.trim();
        msgEl.value = (existing ? existing + '\n\n' : '') + lines.join('\n');
      }

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      })
      .then(function (resp) {
        if (!resp.ok) throw new Error('Form submit failed: ' + resp.status);
        document.dispatchEvent(new CustomEvent('george:form-submit-success', {
          detail: { formName: val(form, 'form-name') }
        }));
        window.lpShowToast();
        form.reset();
        btn.textContent = 'Submit Inquiry →';
        btn.disabled = false;
        if (window.gBar) gBar.calc(); // re-sync hidden fields after reset

        fetch('/.netlify/functions/send-thanks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (emailResp) {
          if (!emailResp.ok) console.warn('Thank-you email failed:', emailResp.status);
        }).catch(function (err) {
          console.warn('Thank-you email failed:', err);
        });
      })
      .catch(function () {
        btn.textContent = 'Submit Inquiry →';
        btn.disabled = false;
        window.lpShowToast(
          'Something went wrong.',
          'Please try again, or email andrew@thegeorgebhm.com directly.'
        );
      });
    });
  });
})();
