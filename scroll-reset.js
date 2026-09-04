/* scroll-reset.js — consistent refresh behavior across desktop and mobile
 *
 * Behavior (identical on every device):
 *   - Reload (refresh) → restore the user to where they were
 *   - bfcache restore (back/forward, swipe-back) → browser preserves naturally
 *   - Fresh navigation with #hash (shared link) → browser scrolls to anchor
 *   - Fresh navigation without #hash → browser default (top)
 *
 * Why we save/restore manually instead of relying on scrollRestoration='auto':
 *   The browser's built-in auto-restoration is unreliable on mobile, especially
 *   iOS Safari — it often doesn't save the position before unload, or restores
 *   at the wrong time after URL bar collapse animations. We handle it ourselves
 *   for consistent cross-device behavior.
 *
 * Why we hide the body during restoration:
 *   Manual restoration via JS necessarily happens AFTER the browser's first
 *   paint, which creates a visible flash: page paints at top → JS scrolls
 *   down → user sees jump. Setting visibility:hidden in the head synchronously
 *   and unhiding after the scroll completes makes the restoration invisible.
 *   Cost: ~50-100ms delay to first paint on reload. Worth it for clean UX.
 *
 * Bonus: blur focused inputs on unload so they don't keep highlight on reload.
 */
(function () {
  'use strict';

  // Take manual control — we don't trust the browser's built-in 'auto' on mobile.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function isReload() {
    var entries = performance.getEntriesByType && performance.getEntriesByType('navigation');
    if (entries && entries[0]) return entries[0].type === 'reload';
    return performance.navigation && performance.navigation.type === 1;
  }

  var KEY = 'sy:' + location.pathname;
  var wasReload = isReload();
  var savedY = wasReload ? parseInt(sessionStorage.getItem(KEY) || '0', 10) : 0;
  // Only restore on reload, only if we have a saved position, and only if
  // there's no #hash that should take precedence.
  var willRestore = wasReload && savedY > 0 && !window.location.hash;

  // On reload, strip any stale #hash so it doesn't override our restoration.
  if (wasReload && window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  // Hide the document until we've scrolled to the saved position — prevents
  // the visible "paint at top, then jump" flash that JS-based restoration
  // otherwise causes.
  if (willRestore) {
    document.documentElement.style.visibility = 'hidden';
  }

  function unhide() {
    document.documentElement.style.visibility = '';
  }

  function restore() {
    if (willRestore) window.scrollTo(0, savedY);
    unhide();
  }

  // Save scroll position on hide. pagehide is more mobile-reliable than
  // beforeunload (which iOS sometimes skips entirely).
  window.addEventListener('pagehide', function () {
    sessionStorage.setItem(KEY, String(window.scrollY));
  });

  // Restore as soon as the DOM is ready (earliest point we can scrollTo
  // a meaningful position). If DOM is already parsed, restore now.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restore);
  } else {
    restore();
  }

  // bfcache restore — browser already preserved scroll, just unhide.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) unhide();
  });

  // Safety: never leave the body hidden forever if something breaks.
  setTimeout(unhide, 1500);

  window.addEventListener('beforeunload', function () {
    document.activeElement && document.activeElement.blur();
  });
}());
