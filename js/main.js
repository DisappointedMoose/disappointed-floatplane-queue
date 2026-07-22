(function () {
  "use strict";

  window.FPQueue = window.FPQueue || {};
  const FPQueue = window.FPQueue;

  // ---------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------

  function init() {
    FPQueue.panel.build();
    FPQueue.settings.init();
    FPQueue.state.load().then(() => {
      if (!FPQueue.state.contextValid) return;
      FPQueue.pageSync.handlePostPageSync();
      FPQueue.autoplay.tryResumePlayback();
    });
    FPQueue.tileButtons.startObserver();
    FPQueue.autoplay.start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
