// Cloud-syncs localStorage to /api/state (MongoDB).
// Runs before the React app mounts; the app keeps using localStorage as-is.
(function () {
  var PUSH_DEBOUNCE_MS = 800;
  var pushTimer = null;
  var hydrating = false;

  var origSet = localStorage.setItem.bind(localStorage);
  var origRemove = localStorage.removeItem.bind(localStorage);
  var origClear = localStorage.clear.bind(localStorage);

  function snapshot() {
    var out = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      out[k] = localStorage.getItem(k);
    }
    return out;
  }

  function schedulePush() {
    if (hydrating) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      pushTimer = null;
      fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot()),
        keepalive: true,
      }).catch(function () {});
    }, PUSH_DEBOUNCE_MS);
  }

  localStorage.setItem = function (k, v) { origSet(k, v); schedulePush(); };
  localStorage.removeItem = function (k) { origRemove(k); schedulePush(); };
  localStorage.clear = function () { origClear(); schedulePush(); };

  // Push any unsaved changes when the tab is hidden / closed.
  window.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && pushTimer) {
      clearTimeout(pushTimer);
      pushTimer = null;
      try {
        var body = JSON.stringify(snapshot());
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/state', new Blob([body], { type: 'application/json' }));
        } else {
          fetch('/api/state', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: body,
            keepalive: true,
          }).catch(function () {});
        }
      } catch (e) {}
    }
  });

  // Hydrate from server BEFORE the app boots. App.jsx awaits window.__cloudReady.
  window.__cloudReady = fetch('/api/state', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (data) {
      if (data && typeof data === 'object') {
        hydrating = true;
        try {
          // Replace local with server snapshot so both users see the same thing.
          var serverKeys = Object.keys(data);
          // Remove local keys not present on server (but only if server has any data).
          if (serverKeys.length > 0) {
            var localKeys = [];
            for (var i = 0; i < localStorage.length; i++) localKeys.push(localStorage.key(i));
            localKeys.forEach(function (k) {
              if (!(k in data)) origRemove(k);
            });
          }
          serverKeys.forEach(function (k) {
            if (typeof data[k] === 'string') origSet(k, data[k]);
          });
        } finally {
          hydrating = false;
        }
      }
    })
    .catch(function () { /* offline / first run — stay on local */ });
})();
