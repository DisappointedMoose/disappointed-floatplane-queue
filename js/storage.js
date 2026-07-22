(function () {
  "use strict";

  window.FPQueue = window.FPQueue || {};
  const FPQueue = window.FPQueue;

  // ---------------------------------------------------------------------
  // Cross-browser storage helpers (promise-based, tolerant of context
  // invalidation after an extension reload/update/disable).
  // ---------------------------------------------------------------------

  const usesPromiseAPI = typeof browser !== "undefined";

  function get(keys) {
    if (usesPromiseAPI) {
      return browser.storage.local.get(keys);
    }
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(keys, (result) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(result);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  function set(items) {
    if (usesPromiseAPI) {
      return browser.storage.local.set(items);
    }
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set(items, () => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  FPQueue.storage = { get, set };
})();
