/* avail.js — availability calendar for landing pages
   Same logic as the inline calendar on index.html with one change:
   gAvailNext scrolls to #inquire (the form) instead of .calc-wrapper */
(function () {
  'use strict';
  var FUNCTION_URL = '/.netlify/functions/availability';
  var BOOKING_START = new Date(2026, 9, 1); // October 1, 2026
  var MAX_MONTHS   = 18;
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var state = { blocked: new Set(), selected: new Set(), viewYear: 0, viewMonth: 0, pickerMode: null };

  var grid        = document.getElementById('availGrid');
  var prevBtn     = document.getElementById('availPrev');
  var nextBtn     = document.getElementById('availNext');
  var monthPick   = document.getElementById('availMonthPick');
  var yearPick    = document.getElementById('availYearPick');
  var pickerOver  = document.getElementById('availPickerOverlay');
  var pickerGrid  = document.getElementById('availPickerGrid');
  var hint        = document.getElementById('availHint');
  var nextCta     = document.getElementById('availNextBtn');

  if (!grid) return;

  function pad(n) { return String(n).padStart(2,'0'); }
  function toDS(y,m,d) { return y+'-'+pad(m+1)+'-'+pad(d); }
  function minBookableDate() {
    var t = new Date();
    t = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    return t > BOOKING_START ? t : new Date(BOOKING_START);
  }
  function todayDS() { var t=minBookableDate(); return toDS(t.getFullYear(),t.getMonth(),t.getDate()); }

  function updateHintAndCta() {
    var n = state.selected.size;
    var msg = '';
    if(n === 1) {
      var ds = Array.from(state.selected)[0];
      var p = ds.split('-');
      msg = new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}) + ' selected';
    }
    if(hint) hint.textContent = msg;
    if(nextCta) nextCta.style.display = n > 0 ? '' : 'none';
    checkFridayWarning();
  }

  function checkFridayWarning() {
    var warnEl = document.getElementById('availWarn');
    if(!warnEl) return;
    if(state.selected.size !== 1) { warnEl.style.display = 'none'; return; }
    if(!window.gBar || !gBar.isFridayAddonOn || !gBar.isFridayAddonOn()) { warnEl.style.display = 'none'; return; }
    var ds = Array.from(state.selected)[0];
    var p = ds.split('-');
    var dt = new Date(+p[0],+p[1]-1,+p[2]);
    if(dt.getDay() !== 6) { warnEl.style.display = 'none'; return; }
    var fri = new Date(dt); fri.setDate(fri.getDate() - 1);
    var fds = toDS(fri.getFullYear(), fri.getMonth(), fri.getDate());
    warnEl.style.display = state.blocked.has(fds) ? '' : 'none';
  }

  window.gAvailRecheck = checkFridayWarning;

  function closePicker() {
    state.pickerMode = null;
    if(pickerOver) pickerOver.style.display = 'none';
    if(pickerGrid) pickerGrid.innerHTML = '';
  }

  function openMonthPicker() {
    if(state.pickerMode === 'month') { closePicker(); return; }
    state.pickerMode = 'month';
    if(pickerGrid) pickerGrid.innerHTML = '';
    if(pickerOver) pickerOver.style.display = '';
    pickerOver.querySelector('.avail-picker-grid').style.gridTemplateColumns = 'repeat(3,1fr)';
    MONTHS_SHORT.forEach(function(name, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = name; b.className = 'avail-picker-btn';
      if(i === state.viewMonth) b.classList.add('current');
      if (state.viewYear === BOOKING_START.getFullYear() && i < BOOKING_START.getMonth()) {
        b.disabled = true;
      }
      b.addEventListener('click', function() {
        if (b.disabled) return;
        state.viewMonth = i; closePicker(); renderMonth(state.viewYear, state.viewMonth);
      });
      pickerGrid.appendChild(b);
    });
  }

  function openYearPicker() {
    if(state.pickerMode === 'year') { closePicker(); return; }
    state.pickerMode = 'year';
    if(pickerGrid) pickerGrid.innerHTML = '';
    if(pickerOver) pickerOver.style.display = '';
    pickerOver.querySelector('.avail-picker-grid').style.gridTemplateColumns = 'repeat(4,1fr)';
    var nowY = minBookableDate().getFullYear();
    for(var y = nowY; y <= nowY + 2; y++) {
      (function(yr) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = yr; b.className = 'avail-picker-btn';
        if(yr === state.viewYear) b.classList.add('current');
        b.addEventListener('click', function() {
          state.viewYear = yr; closePicker(); renderMonth(state.viewYear, state.viewMonth);
        });
        pickerGrid.appendChild(b);
      })(y);
    }
  }

  function renderMonth(y,m) {
    closePicker();
    var minMonth = new Date(BOOKING_START.getFullYear(), BOOKING_START.getMonth(), 1);
    if (new Date(y,m,1) < minMonth) {
      y = BOOKING_START.getFullYear();
      m = BOOKING_START.getMonth();
      state.viewYear = y;
      state.viewMonth = m;
    }
    var today=todayDS();
    var now=minBookableDate(); var nowY=now.getFullYear(); var nowM=now.getMonth();
    if(monthPick) monthPick.textContent = MONTHS[m];
    if(yearPick)  yearPick.textContent  = y;
    prevBtn.disabled = (y===nowY && m===nowM);
    nextBtn.disabled = new Date(y,m+1,1) >= new Date(nowY,nowM+MAX_MONTHS,1);
    var firstDow=new Date(y,m,1).getDay();
    var days=new Date(y,m+1,0).getDate();
    grid.innerHTML='';
    for(var i=0;i<firstDow;i++){
      var e=document.createElement('div');
      e.className='avail-day avail-day--empty'; e.setAttribute('aria-hidden','true');
      grid.appendChild(e);
    }
    for(var d=1;d<=days;d++){
      var ds=toDS(y,m,d);
      var btn=document.createElement('button');
      btn.type='button'; btn.textContent=d;
      btn.setAttribute('data-date',ds);
      var isPast=ds<today, isBooked=state.blocked.has(ds), isToday=ds===today;
      var isSel = state.selected.has(ds);
      var cls='avail-day';
      if(isToday)  cls+=' avail-day--today';
      if(isPast)   cls+=' avail-day--past';
      if(isBooked) cls+=' avail-day--booked';
      if(isSel)    cls+=' avail-day--selected';
      btn.className=cls; btn.disabled=isPast||isBooked;
      if(!isPast&&!isBooked){
        btn.addEventListener('click',function(ev){
          var date=ev.currentTarget.getAttribute('data-date');
          if(state.selected.has(date)) state.selected.delete(date);
          else { state.selected.clear(); state.selected.add(date); }
          updateHintAndCta();
          renderMonth(state.viewYear,state.viewMonth);
        });
      }
      grid.appendChild(btn);
    }
    updateHintAndCta();
  }

  function showStatus(msg, cls) {
    var d=document.createElement('div');
    d.className='avail-status'+(cls?' '+cls:'');
    d.textContent=msg;
    grid.innerHTML=''; grid.appendChild(d);
  }

  if(monthPick) monthPick.addEventListener('click', openMonthPicker);
  if(yearPick)  yearPick.addEventListener('click',  openYearPicker);

  prevBtn.addEventListener('click',function(){
    if(state.viewMonth===0){state.viewYear--;state.viewMonth=11;}else{state.viewMonth--;}
    renderMonth(state.viewYear,state.viewMonth);
  });
  nextBtn.addEventListener('click',function(){
    if(state.viewMonth===11){state.viewYear++;state.viewMonth=0;}else{state.viewMonth++;}
    renderMonth(state.viewYear,state.viewMonth);
  });

  // On landing pages: pre-fill the inquiry form and scroll down to it
  window.gAvailNext = function() {
    if(state.selected.size === 0) return;
    var dates = Array.from(state.selected).sort();
    var edate = document.getElementById('edate');
    if(edate) edate.value = dates[0];
    var gc = document.getElementById('gc');
    if(gc) {
      var g = parseInt((document.getElementById('bcGuests')||{}).value||0);
      var range = g<100?'Under 100': g<=200?'100 – 200': g<=300?'200 – 300': g<=375?'300 – 375':'375 – 500';
      for(var i=0;i<gc.options.length;i++){ if(gc.options[i].text===range){ gc.selectedIndex=i; break; } }
    }
    if(window.gBar) gBar.setVenueFromDates(dates);
    // Scroll to the inquiry form — landing pages use #inquire, index uses #contact
    var formEl = document.getElementById('inquire') || document.getElementById('contact');
    if(formEl) formEl.scrollIntoView({behavior:'smooth', block:'start'});
  };

  var now=minBookableDate();
  state.viewYear=now.getFullYear(); state.viewMonth=now.getMonth();
  showStatus('Checking availability…','avail-status--loading');
  fetch(FUNCTION_URL)
    .then(function(r){
      if (!r.ok) throw new Error('Availability unavailable');
      return r.json();
    })
    .then(function(dates){ state.blocked=new Set(Array.isArray(dates)?dates:[]); renderMonth(state.viewYear,state.viewMonth); })
    .catch(function(){
      showStatus('Availability is temporarily unavailable. Please send an inquiry and we will confirm your date directly.','avail-status--error');
      if(nextCta) nextCta.style.display = 'none';
    });
}());
