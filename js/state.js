(function () {
  "use strict";

  window.FPQueue = window.FPQueue || {};
  const FPQueue = window.FPQueue;

  // ---------------------------------------------------------------------
  // Shared queue state, persisted to browser.storage.local
  // ---------------------------------------------------------------------

  const invalidationHandlers = [];

  const state = {
    queue: [],
    currentIndex: -1,
    contextValid: true,
    // Set right before navigating to a video picked from the queue, so the
    // next page load knows to force playback back to 0:00 instead of
    // honoring Floatplane's own "resume where you left off" position.
    forceRestart: false,
    // User settings, persisted alongside the queue.
    autoRemoveOnFinish: true,
    restartFromBeginning: true,
  };

  // Lets other modules (e.g. autoplay's interval) clean themselves up once
  // when the extension context is invalidated, without state.js needing to
  // know about them directly.
  function onInvalidate(handler) {
    invalidationHandlers.push(handler);
  }

  function invalidate() {
    if (!state.contextValid) return;
    state.contextValid = false;
    invalidationHandlers.forEach((handler) => handler());
  }

  async function load() {
    let result;
    try {
      result = await FPQueue.storage.get([
        "fp_queue",
        "fp_queue_index",
        "fp_force_restart",
        "fp_auto_remove_on_finish",
        "fp_restart_from_beginning",
      ]);
    } catch (e) {
      invalidate();
      return;
    }
    state.queue = Array.isArray(result.fp_queue) ? result.fp_queue : [];
    state.currentIndex =
      typeof result.fp_queue_index === "number" ? result.fp_queue_index : -1;
    state.forceRestart = !!result.fp_force_restart;
    state.autoRemoveOnFinish =
      typeof result.fp_auto_remove_on_finish === "boolean"
        ? result.fp_auto_remove_on_finish
        : true;
    state.restartFromBeginning =
      typeof result.fp_restart_from_beginning === "boolean"
        ? result.fp_restart_from_beginning
        : true;
    FPQueue.render.all();
  }

  async function save() {
    try {
      await FPQueue.storage.set({
        fp_queue: state.queue,
        fp_queue_index: state.currentIndex,
        fp_force_restart: state.forceRestart,
        fp_auto_remove_on_finish: state.autoRemoveOnFinish,
        fp_restart_from_beginning: state.restartFromBeginning,
      });
    } catch (e) {
      invalidate();
    }
  }

  FPQueue.state = Object.assign(state, {
    onInvalidate,
    invalidate,
    load,
    save,
  });
})();
