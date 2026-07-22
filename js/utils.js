(function () {
  "use strict";

  window.FPQueue = window.FPQueue || {};
  const FPQueue = window.FPQueue;

  // ---------------------------------------------------------------------
  // Small shared helpers: URL parsing, navigation, toast notifications
  // ---------------------------------------------------------------------

  let notificationEl = null;
  let notificationTimeoutId = null;

  function getPostIdFromUrl(url) {
    try {
      const u = new URL(url, location.origin);
      const match = u.pathname.match(/\/post\/([^/?#]+)/);
      return match ? match[1] : null;
    } catch (e) {
      return null;
    }
  }

  function navigate(url) {
    window.location.href = url;
  }

  function showToast(text) {
    if (!notificationEl) {
      notificationEl = document.createElement("div");
      notificationEl.id = "fp-queue-notification";
      document.body.appendChild(notificationEl);
    }
    notificationEl.textContent = text;
    notificationEl.classList.add("show");
    if (notificationTimeoutId) clearTimeout(notificationTimeoutId);
    notificationTimeoutId = setTimeout(() => {
      notificationEl.classList.remove("show");
    }, 3000);
  }

  FPQueue.utils = { getPostIdFromUrl, navigate, showToast };
})();
