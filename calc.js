/* calc.js — config-aware pricing calculator for landing pages
   Reads window.CALC_CONFIG before this script for per-page defaults.
   Example:
     window.CALC_CONFIG = { defaultVenue: 8000, defaultLabel: 'Saturday', showFriday: true, eventLabel: 'wedding' };
*/
(function () {
  'use strict';

  var CFG = window.CALC_CONFIG || { defaultVenue: 8000, defaultLabel: 'Saturday', showFriday: false, eventLabel: 'event' };

  var gBar = (function () {
    var S = {
      venue: CFG.defaultVenue, tier: 2, rate: 15,
      totalGuests: 150,
      hours: 3,
      barEnabled: false,
      floralEnabled: false,
      barExpanded: false,
      floralExpanded: false,
      durationExpanded: false,
      floralTier: 'essential',
      addons: { courtyard: false, champagne: false, signature: false, friday: false },
      multiDayCount: 1,
      _auto: false
    };
    var TR = { 1:10, 2:15, 3:19, 4:24 };
    var TN = { 1:'Beer & Wine', 2:'Full Bar', 3:'Premium', 4:'Reserve' };
    function getActiveLabel() { var b=document.querySelector('.calc-day-btn.active'); return b?(b.dataset.label||''):''; }
    var VL = { 6000:'Sun & Weekday', 7000:'Friday', 8000:'Saturday' };
    var FLORAL = {
      essential: [3000,  4000,  5000],
      premium:   [5000,  7500,  10000],
      luxury:    [10000, 15000, 25000]
    };

    function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

    function floralCost(guests, tier) {
      var steps = FLORAL[tier] || FLORAL.essential;
      if (guests <= 150) return steps[0];
      if (guests <= 300) return steps[1];
      return steps[2];
    }

    function guestRangeLabel(guests) {
      if (guests < 100) return 'Under 100';
      if (guests <= 200) return '100 – 200';
      if (guests <= 300) return '200 – 300';
      if (guests <= 375) return '300 – 375';
      return '375 – 500';
    }

    function syncGuestCountSelect() {
      var gc = document.getElementById('gc');
      if (!gc) return;
      var range = guestRangeLabel(S.totalGuests);
      for (var i = 0; i < gc.options.length; i++) {
        if (gc.options[i].text === range) {
          gc.selectedIndex = i;
          break;
        }
      }
    }

    function applyTier(n) {
      S.tier = n; S.rate = TR[n];
      document.querySelectorAll('.bc-tier-btn[data-tier]').forEach(function(b) {
        b.classList.toggle('active', parseInt(b.dataset.tier) === n);
      });
    }

    function showUpgrade(msg) {
      var t = document.getElementById('calcToast');
      if (!msg) {
        if (t) t.classList.remove('calc-toast--show');
        return;
      }
      if (!t) {
        t = document.createElement('div');
        t.id = 'calcToast';
        t.className = 'calc-toast';
        t.setAttribute('role', 'status');
        t.setAttribute('aria-live', 'polite');
        document.body.appendChild(t);
      }
      t.innerHTML = msg;
      void t.offsetWidth; // force reflow so transition re-triggers on rapid reshow
      t.classList.add('calc-toast--show');
      clearTimeout(t._hideTimer);
      t._hideTimer = setTimeout(function () {
        t.classList.remove('calc-toast--show');
      }, 4500);
    }

    function setCourtyardUI(active) {
      var btn = document.getElementById('courtyardAddBtn');
      var status = document.getElementById('courtyardStatus');
      if (!btn) return;
      btn.classList.toggle('active', active);
      if (status) status.textContent = (active ? 'Remove' : 'Add') + ' The Courtyard • $1,500';
    }

    // Reflect bar add/remove state across the pill and the open block
    function setBarAdded(on) {
      S.barEnabled = on;
      var btn   = document.getElementById('barAddBtn');
      var block = document.getElementById('barBlock');
      if (btn)   btn.classList.toggle('active', on);
      if (block) block.classList.toggle('is-added', on);
    }

    function updateCalcPanel() {
      var barSection   = document.getElementById('barSection');
      var floralSection= document.getElementById('floralSection');
      var barRow       = document.getElementById('barToggle');
      var floralRow    = document.getElementById('floralToggle');
      var barCaret     = document.getElementById('barCaret');
      var floralCaret  = document.getElementById('floralCaret');
      var durGroup     = document.getElementById('durationGroup');
      var hoursInput   = document.getElementById('bcHours');
      if (barSection)   { barSection.style.display    = S.barExpanded    ? '' : 'none'; }
      if (floralSection){ floralSection.style.display  = S.floralExpanded ? '' : 'none';
                          floralSection.classList.toggle('calc-right-panel--border', S.barExpanded && S.floralExpanded); }
      if (barRow)        barRow.classList.toggle('addon-row--expanded', S.barExpanded);
      if (floralRow)     floralRow.classList.toggle('addon-row--expanded', S.floralExpanded);
      if (barCaret)     {
        barCaret.classList.toggle('is-open', S.barExpanded);
        barCaret.setAttribute('aria-expanded', S.barExpanded ? 'true' : 'false');
      }
      if (floralCaret)  {
        floralCaret.classList.toggle('is-open', S.floralExpanded);
        floralCaret.setAttribute('aria-expanded', S.floralExpanded ? 'true' : 'false');
      }
      if (durGroup)      durGroup.classList.remove('duration-disabled');
      if (hoursInput)    hoursInput.disabled = false;
    }

    function calc() {
      var guestsEl = document.getElementById('bcGuests');
      S.totalGuests = guestsEl ? (parseInt(guestsEl.value) || 50) : S.totalGuests;
      var drinkers  = Math.ceil(S.totalGuests * 0.75);

      // Live bar estimate — always computed so the open Bar block previews a price before it's added
      var barPreview   = S.rate * S.hours * drinkers;
      var champPreview = S.addons.champagne ? S.totalGuests * 5 : 0;
      var sigPreview   = S.addons.signature ? 200 : 0;
      // Grand total only includes the bar (and its add-ons) once it's been added
      var bar    = S.barEnabled ? barPreview   : 0;
      var champ  = S.barEnabled ? champPreview : 0;
      var sig    = S.barEnabled ? sigPreview   : 0;
      var floral = S.floralEnabled ? floralCost(S.totalGuests, S.floralTier) : 0;
      var crt    = S.addons.courtyard  ? 1500 : 0;
      // Friday upsell: only shown if CALC_CONFIG.showFriday AND single-day Saturday
      var showFriRow = CFG.showFriday && S.multiDayCount === 1 && S.venue === 8000;
      var fri    = showFriRow && S.addons.friday ? 3000 : 0;
      if (!showFriRow) S.addons.friday = false;
      var grand  = S.venue + bar + floral + crt + champ + sig + fri;

      function el(id) { return document.getElementById(id); }
      function setText(id, val) { var e=el(id); if(e) e.textContent=val; }
      function setDisplay(id, val) { var e=el(id); if(e) e.style.display=val; }

      setDisplay('friAddBtn', showFriRow ? '' : 'none');

      var venueLabel = S.multiDayCount > 1 ? S.multiDayCount + '-day booking' : getActiveLabel();

      setText('bcTotal', fmt(grand));
      var _barMeta = S.barEnabled ? ' · ' + S.totalGuests + ' guests · ' + S.hours + ' hrs · Tier ' + S.tier + ' ' + TN[S.tier] : ' · Venue Price';
      setText('bcTotalSub', venueLabel + _barMeta);
      setText('spbTotal', fmt(grand));
      setText('spbMeta',  venueLabel + _barMeta);

      setText('bcBrVenue', fmt(S.venue));
      var _bcBrBar = el('bcBrBar');
      if (_bcBrBar) { if (_bcBrBar.parentElement) _bcBrBar.parentElement.style.display = S.barEnabled ? '' : 'none'; _bcBrBar.textContent = fmt(bar); }

      setDisplay('bcBrFriRow',   fri   ? '' : 'none');
      setText('bcBrFri',    fmt(fri));
      setDisplay('bcBrCrtRow',   crt   ? '' : 'none');
      setText('bcBrCrt',    fmt(crt));
      setDisplay('bcBrChampRow', champ ? '' : 'none');
      setText('bcBrChamp',  fmt(champ));
      setDisplay('bcBrSigRow',   sig   ? '' : 'none');
      setText('bcBrSig',    fmt(sig));
      setDisplay('bcBrFloralRow',floral ? '' : 'none');
      setText('bcBrFloral', fmt(floral));
      setText('bcBrTotal',  fmt(grand));

      var barSubEl = document.getElementById('barSubtotal');
      if (barSubEl) barSubEl.textContent = fmt(barPreview);
      var barBtnLbl = document.getElementById('barStatus');
      if (barBtnLbl) barBtnLbl.textContent = (S.barEnabled ? 'Remove' : 'Add') + ' The Bar • ' + fmt(barPreview);
      var floralSubEl = document.getElementById('floralSubtotal');
      if (floralSubEl) floralSubEl.textContent = S.floralEnabled ? fmt(floral) : '—';
      var floralTP = document.getElementById('floralTogglePrice');
      if (floralTP) floralTP.textContent = S.floralEnabled ? fmt(floral) : '+Est.';

      var venueNames = { 6000:'$6,000', 7000:'$7,000', 8000:'$8,000' };
      var tierNames = { 1:'Tier 1 - Beer & Wine', 2:'Tier 2 - Full Bar', 3:'Tier 3 - Premium', 4:'Tier 4 - Reserve' };
      var floralNames = { essential:'Essential', premium:'Premium', luxury:'Luxury' };
      function setHidden(id, val) { var h = document.getElementById(id); if (h) h.value = val; }
      setHidden('hCalcVenue', venueNames[S.venue] || fmt(S.venue));
      setHidden('hCalcGuests', S.totalGuests + ' guests');
      setHidden('hCalcCourtyard', S.addons.courtyard ? 'Yes — $1,500' : 'No');
      setHidden('hCalcBar', S.barEnabled
        ? tierNames[S.tier] + ' - ' + S.hours + ' hrs - ' + fmt(bar) + ' est.'
          + (champ ? ' + Champagne Toast' : '') + (sig ? ' + Signature Cocktail' : '')
        : 'No');
      setHidden('hCalcFlorals', S.floralEnabled
        ? floralNames[S.floralTier] + ' - ' + fmt(floral) + ' est.'
        : 'No');
      setHidden('hCalcTotal', fmt(grand) + ' estimated total');
      syncGuestCountSelect();
    }

    return {
      setVenueCard: function (card) {
        document.querySelectorAll('.calc-day-btn').forEach(function(c){ c.classList.remove('active'); });
        card.classList.add('active');
        S.venue = parseInt(card.dataset.venue);
        S.multiDayCount = 1;
        calc();
      },
      toggleFriday: function () {
        S.addons.friday = !S.addons.friday;
        var btn = document.getElementById('friAddBtn');
        var lbl = document.getElementById('friStatus');
        if (btn) btn.classList.toggle('active', S.addons.friday);
        if (lbl) lbl.textContent = (S.addons.friday ? 'Remove' : 'Add') + ' The Rehearsal • $3,000';
        calc();
        if (typeof window.gAvailRecheck === 'function') window.gAvailRecheck();
      },
      isFridayAddonOn: function () { return !!S.addons.friday; },
      setVenueFromDates: function (dates) {
        if (!dates || dates.length === 0) return;
        var DOW_RATE = [6000,6000,6000,6000,6000,7000,8000];
        var rates = dates.map(function(ds) {
          var p = ds.split('-');
          return DOW_RATE[new Date(+p[0],+p[1]-1,+p[2]).getDay()];
        });
        var maxRate = Math.max.apply(null, rates);
        var contiguous = (function(d) {
          for(var i=1;i<d.length;i++){
            var prev=new Date(d[i-1]+'T00:00:00'); prev.setDate(prev.getDate()+1);
            if(prev.toISOString().slice(0,10)!==d[i]) return false;
          }
          return true;
        })(dates);
        var n = contiguous ? dates.length : 1;
        S.venue = maxRate + (n >= 2 ? 1500 : 0) + (n > 2 ? (n - 2) * 1000 : 0);
        S.multiDayCount = n;
        var targetLabel;
        if (maxRate === 8000) targetLabel = 'Saturday';
        else if (maxRate === 7000) targetLabel = 'Friday';
        else {
          var hasSun = dates.some(function(ds) {
            var p = ds.split('-');
            return new Date(+p[0],+p[1]-1,+p[2]).getDay() === 0;
          });
          targetLabel = hasSun ? 'Sunday' : 'Weekday';
        }
        document.querySelectorAll('.calc-day-btn').forEach(function(b) {
          b.classList.toggle('active', b.dataset.label === targetLabel);
        });
        calc();
      },
      setHours: function (btn) {
        document.querySelectorAll('.bc-hour-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        S.hours = parseFloat(btn.dataset.hours);
        var cur = document.getElementById('durCurrent');
        if (cur) cur.textContent = btn.dataset.hours + ' hrs';
        if (!S.barEnabled) setBarAdded(true);
        calc();
      },
      setTier: function (btn) {
        var requestedTier = parseInt(btn.dataset.tier);
        // Signature cocktail requires Tier 3+ — refuse downgrades while it's on
        if (S.addons.signature && requestedTier < 3) {
          showUpgrade('Signature cocktails require <strong>Tier 3: Premium</strong> or higher. Remove the signature cocktail to choose a lower tier.');
          return;
        }
        applyTier(requestedTier); S._auto = false; showUpgrade('');
        if (!S.barEnabled) setBarAdded(true);
        calc();
      },
      setFloralTier: function (btn) {
        S.floralTier = btn.dataset.floral;
        document.querySelectorAll('.bc-tier-btn[data-floral]').forEach(function(b) {
          b.classList.toggle('active', b.dataset.floral === S.floralTier);
        });
        calc();
      },
      toggleAddon: function (key) {
        S.addons[key] = !S.addons[key];
        var checkEl = document.getElementById('bcCheck-'+key);
        if (checkEl) checkEl.classList.toggle('checked', S.addons[key]);
        var nP = S.addons.signature;
        if (nP && S.tier < 3) {
          applyTier(3); S._auto = true;
          showUpgrade('Upgraded to <strong>Tier 3: Premium</strong> for your named signature cocktail.');
        } else if (!nP && S._auto) {
          applyTier(1); S._auto = false; showUpgrade('');
        }
        if (S.addons[key] && !S.barEnabled) setBarAdded(true);
        calc();
      },
      toggleBar: function () {
        setBarAdded(!S.barEnabled);
        updateCalcPanel();
        calc();
      },
      toggleFloral: function () {
        S.floralEnabled = !S.floralEnabled;
        S.floralExpanded = S.floralEnabled;
        if (S.floralExpanded) S.barExpanded = false;
        var btn    = document.getElementById('floralAddBtn');
        var status = document.getElementById('floralStatus');
        if (btn)    btn.classList.toggle('active', S.floralEnabled);
        if (status) status.textContent = S.floralEnabled ? 'Remove' : 'Add';
        updateCalcPanel();
        calc();
      },
      toggleDuration: function () {
        S.durationExpanded = !S.durationExpanded;
        var hours = document.getElementById('durHours');
        var tog   = document.getElementById('durToggle');
        if (hours) hours.style.display = S.durationExpanded ? '' : 'none';
        if (tog) {
          tog.classList.toggle('is-open', S.durationExpanded);
          tog.setAttribute('aria-expanded', S.durationExpanded ? 'true' : 'false');
        }
      },
      toggleBarDetails: function () {
        S.barExpanded = !S.barExpanded;
        if (S.barExpanded) S.floralExpanded = false;
        updateCalcPanel();
      },
      toggleFloralDetails: function () {
        S.floralExpanded = !S.floralExpanded;
        if (S.floralExpanded) S.barExpanded = false;
        updateCalcPanel();
      },
      toggleCourtyard: function () {
        S.addons.courtyard = !S.addons.courtyard;
        setCourtyardUI(S.addons.courtyard);
        calc();
      },
      enforceMin: function () {
        var el = document.getElementById('bcGuests');
        var v = el ? (parseInt(el.value)||50) : 50;
        if (v < 50 && el) el.value = 50;
        calc();
      },
      calc: calc
    };
  }());

  window.gBar = gBar;

  // Custom guests thumb — positions the pill label over the hidden native thumb
  window.updateGuestsThumb = function (input) {
    var thumb = document.getElementById('bcGuestsThumb');
    if (!thumb || !input) return;
    var min = parseFloat(input.min) || 50;
    var max = parseFloat(input.max) || 500;
    var val = parseFloat(input.value) || 150;
    var pct = (val - min) / (max - min);
    var thumbW = thumb.offsetWidth;
    var trackW = input.offsetWidth;
    thumb.style.left = (thumbW / 2 + pct * (trackW - thumbW)) + 'px';
  };

  // Init: set correct day button active, run calc, position guests thumb
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.calc-day-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.label === CFG.defaultLabel);
    });
    gBar.calc();
    var gEl = document.getElementById('bcGuests');
    if (gEl) window.updateGuestsThumb(gEl);
  });

}());
